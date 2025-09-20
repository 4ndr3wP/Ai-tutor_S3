from __future__ import annotations

import logging
import threading
import traceback
from collections import defaultdict
from contextlib import asynccontextmanager
from typing import Dict, List, Optional, Any
import os
import datetime
import json
from pathlib import Path

import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

from langchain_community.llms import Ollama
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import Runnable
from langchain.embeddings.base import Embeddings
from langchain.memory import ConversationBufferWindowMemory
from langchain.prompts import PromptTemplate
from langchain.schema import AIMessage, HumanMessage

# --------------------------------------------------------------------------- #
# Configuration                                                               #
# --------------------------------------------------------------------------- #
class CFG:
    """Configuration settings for the AI Tutor backend."""
    # Model settings - CHANGE THIS TO ANY OF YOUR OLLAMA MODELS
    MODEL_NAME = "phi3"  # Change this to: llama3.2, qwen2.5, mistral, gemma2, etc.
    EMBEDDING_MODEL = "nomic-ai/nomic-embed-text-v1.5"
    PERSIST_DIR = "./RL_db_reference_1k_500"
    
    # Generation parameters
    TEMPERATURE = 0.1  # Using same temperature as your single-turn version
    NUM_CTX = 8192     # Context window for Ollama
    
    # Retrieval & memory
    DEFAULT_K = 5      # Number of embedded chunks to retrieve
    MEMORY_WINDOW_K = 5
    
    # Timeout settings
    REQUEST_TIMEOUT = 300.0  # 5 minutes

# --------------------------------------------------------------------------- #
# Logging                                                                     #
# --------------------------------------------------------------------------- #
logging.basicConfig(
    level=logging.INFO, 
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s"
)
log = logging.getLogger("ai-tutor-multi")

# --------------------------------------------------------------------------- #
# Embeddings                                                                  #
# --------------------------------------------------------------------------- #
class SentenceTransformerEmbeddings(Embeddings):
    """
    Optimized embedding wrapper for SentenceTransformer, following best
    practices for models like nomic-embed-text.
    """
    
    def __init__(self, model_name: str = CFG.EMBEDDING_MODEL, batch_size: int = 256):
        super().__init__()
        # Prioritize MPS (Metal Performance Shaders) for Apple Silicon, then CUDA, then CPU
        if torch.backends.mps.is_available():
            self.device = "mps"
        elif torch.cuda.is_available():
            self.device = "cuda" 
        else:
            self.device = "cpu"
            
        self.batch_size = batch_size
        
        log.info(f"Loading embeddings on {self.device}")
        self.model = SentenceTransformer(
            model_name, 
            device=self.device, 
            trust_remote_code=True
        )

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embeds documents with a prefix for retrieval-focused tasks."""
        prefixed = [f"search_document: {text}" for text in texts]
        return self.model.encode(
            prefixed, 
            convert_to_tensor=False, 
            batch_size=self.batch_size
        ).tolist()

    def embed_query(self, text: str) -> List[float]:
        """Embeds a single query with a prefix for retrieval-focused tasks."""
        return self.model.encode(
            f"search_query: {text}", 
            convert_to_tensor=False
        ).tolist()

# --------------------------------------------------------------------------- #
# Prompt Template                                                             #
# --------------------------------------------------------------------------- #
RAG_TEMPLATE = """<|im_start|>system<|im_sep|>
You are an AI tutor assisting with university unit content. You will be given
course context with source information, chat history, and a student question.

1. Use ONLY the context and history to answer factually and clearly.
2. CRITICAL: Preserve exact numbers, hyper-parameters, acronyms, algorithms, and names 
   exactly as stated in the history. Do NOT paraphrase or generalize them.
3. If information from the history is requested, check the entire conversation carefully.
4. Stay concise and on-topic.
5. If the question is outside the context, give a brief overview answer and do not hallucinate.
6. IMPORTANT: After your answer, provide "Related material:" followed by the actual sources 
   used from the context (shown in [Source: ...] tags). Use the exact source names provided.
   Example: "Related material: [Week 5 slides, Week 5 (SIT796-5.1P)]"
7. Use Australian English spelling (e.g., "organise" not "organize", "colour" not "color", 
   "centre" not "center", "realise" not "realize", "analyse" not "analyze").
8. If the question is malicious or sensitive, REFUSE to answer.

<|im_start|>user<|im_sep|>
Conversation history:
{chat_history}

Context:
{context}

Question:
{question}

Answer:
<|im_start|>assistant<|im_sep|>
"""

PROMPT = PromptTemplate(
    input_variables=["context", "question", "chat_history"],
    template=RAG_TEMPLATE,
)

# --------------------------------------------------------------------------- #
# Multi-turn Manager with LCEL                                                #
# --------------------------------------------------------------------------- #
class MultiTurnManager:
    """Manages the LLM, vectorstore, and per-session memory using LCEL."""

    def __init__(self):
        log.info("Initializing multi-turn RAG system with LCEL...")
        
        # Initialize LLM with Ollama
        log.info(f"Loading model: {CFG.MODEL_NAME}")
        self.llm = Ollama(
            model=CFG.MODEL_NAME,
            temperature=CFG.TEMPERATURE,
            num_ctx=CFG.NUM_CTX,
        )
        log.info("✅ LLM ready")

        # Initialize embeddings & vectorstore
        self.embeddings = SentenceTransformerEmbeddings()
        self.vdb = Chroma(
            persist_directory=CFG.PERSIST_DIR,
            embedding_function=self.embeddings,
        )
        self.retriever = self.vdb.as_retriever(
            search_type="similarity",
            search_kwargs={"k": CFG.DEFAULT_K}
        )
        log.info("✅ Vectorstore and retriever ready")

        # Define the primary chain using LangChain Expression Language (LCEL)
        self.chain: Runnable = PROMPT | self.llm | StrOutputParser()
        
        # Session management
        self._memories: Dict = {}
        self._locks: Dict[str, threading.Lock] = defaultdict(threading.Lock)
        
        log.info("✅ Multi-turn LCEL system ready")

    def _get_memory(self, session_id: str) -> ConversationBufferWindowMemory:
        """Thread-safe factory for session-specific memory."""
        with self._locks[session_id]:
            if session_id not in self._memories:
                self._memories[session_id] = ConversationBufferWindowMemory(
                    k=CFG.MEMORY_WINDOW_K,
                    memory_key="chat_history",
                    return_messages=True,
                )
                log.info(f"Created new window memory for session {session_id[:8]}...(k={CFG.MEMORY_WINDOW_K})")
            return self._memories[session_id]

    @staticmethod
    def _format_docs(docs: List) -> str:
        """Joins document contents with accurate source information for context."""
        if not docs:
            return "No relevant documents found."
        
        formatted_sections = []
        sources = []
        
        for doc in docs:
            # Extract source information from metadata
            metadata = getattr(doc, 'metadata', {})
            source = metadata.get('source', 'Unknown source')
            
            # Parse the source path to get accurate information
            source_path = Path(source)
            filename = source_path.name
            
            # Determine content type and week from the actual file path
            source_info = ""
            
            # Check if it's an OnTrack task
            if 'OnTrack' in str(source_path) or filename.endswith('P OnTrack Task Sheet.md') or filename.endswith('C OnTrack Task Sheet.md'):
                # OnTrack task file
                if '.1P' in filename or '.2C' in filename or '.1C' in filename or '.2P' in filename:
                    task_id = filename.split(' ')[0]  # e.g., "2.1P"
                    source_info = f"OnTrack Task {task_id}"
                else:
                    source_info = f"OnTrack Task ({filename.replace('.md', '')})"
            else:
                # Other content files
                source_info = f"Course Material ({filename.replace('.md', '')})"
            
            if source_info not in sources:
                sources.append(source_info)
            
            # Format the document content with source
            formatted_sections.append(f"[Source: {source_info}]\n{doc.page_content}")
        
        # Join all sections
        context = "\n\n".join(formatted_sections)
        
        if sources:
            context += f"\n\n[Available sources in this context: {', '.join(sources)}]"
        
        return context
        
    @staticmethod
    def _format_history(messages: List) -> str:
        """Formats chat history into a human-readable string for the prompt."""
        if not messages:
            return "No previous conversation."
        
        lines = []
        for msg in messages:
            if isinstance(msg, HumanMessage) or getattr(msg, 'type', '') == 'human':
                lines.append(f"Student: {msg.content}")
            elif isinstance(msg, AIMessage) or getattr(msg, 'type', '') == 'ai':
                lines.append(f"AI Tutor: {msg.content}")
        
        return "\n".join(lines)

    async def ask(self, question: str, session_id: str, k: Optional[int] = None) -> str:
        """
        Handles a user query by retrieving context, incorporating memory,
        and generating a response using the LCEL chain.
        """
        try:
            # 1. Get session-specific memory
            memory = self._get_memory(session_id)
            
            # 2. Retrieve relevant documents
            search_k = k or CFG.DEFAULT_K
            docs = self.retriever.get_relevant_documents(question)
            
            context = self._format_docs(docs)
            
            # 3. Load and format chat history
            memory_vars = memory.load_memory_variables({})
            history_messages = memory_vars.get("chat_history", [])
            history = self._format_history(history_messages)
            
            log.info(f"Session {session_id[:8]}: {len(history_messages)} previous messages. Retrieved {len(docs)} docs.")
            
            # 4. Invoke the LCEL chain with all necessary inputs
            response = await self.chain.ainvoke({
                "context": context,
                "question": question,
                "chat_history": history
            })
            
            # 5. Save the new interaction to memory
            memory.save_context({"input": question}, {"output": response})
            
            # 6. Log interaction to file
            self._log_interaction(question, response, session_id)
            
            return response
            
        except Exception as e:
            log.error(f"Failed to generate response for session {session_id[:8]}: {e}")
            log.error(traceback.format_exc())
            return "I'm experiencing some technical difficulties at the moment. Please try your question again."

    def _log_interaction(self, query: str, response: str, session_id: str, filename: str = "chat_history.json"):
        """Log interaction to JSON file."""
        entry = {
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "session_id": session_id,
            "user_query": query,
            "model_response": response
        }
        with threading.Lock():
            if not os.path.exists(filename):
                history = []
            else:
                with open(filename, "r", encoding="utf-8") as file:
                    try:
                        history = json.load(file)
                    except json.JSONDecodeError:
                        history = []
            history.append(entry)
            with open(filename, "w", encoding="utf-8") as file:
                json.dump(history, file, ensure_ascii=False, indent=4)

# --------------------------------------------------------------------------- #
# FastAPI Application                                                         #
# --------------------------------------------------------------------------- #
manager: Optional = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management."""
    global manager
    log.info("Application starting up...")
    manager = MultiTurnManager()
    yield
    log.info("Application shutting down.")

app = FastAPI(
    title="AI-Tutor Multi-turn Local", 
    version="2.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------------------------------- #
# API Models & Routes                                                         #
# --------------------------------------------------------------------------- #
class QueryRequest(BaseModel):
    query: str
    session_id: str
    k: Optional[int] = None

class QueryResponse(BaseModel):
    response: str
    session_id: str

@app.get("/health", summary="Health Check")
async def health():
    """Provides the operational status of the service."""
    return {
        "status": "ok" if manager else "initializing",
        "model": CFG.MODEL_NAME,
        "memory_window_k": CFG.MEMORY_WINDOW_K
    }

@app.post("/query", response_model=QueryResponse, summary="Process a User Query")
async def query_endpoint(request: QueryRequest):
    """
    Main endpoint for receiving user questions and returning AI-generated answers.
    """
    if not manager:
        raise HTTPException(
            status_code=503, 
            detail="System is initializing, please retry in a moment."
        )

    query = request.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    try:
        response_text = await manager.ask(query, request.session_id, request.k)
        return QueryResponse(response=response_text, session_id=request.session_id)
        
    except Exception as e:
        log.error(f"Critical endpoint error for session {request.session_id[:8]}: {e}")
        raise HTTPException(status_code=500, detail="An unexpected server error occurred.")

# Quiz generation models
class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: int  # Index of correct answer (0-3)
    explanation: str

class QuizRequest(BaseModel):
    task_id: str
    task_title: str
    filename: str
    num_questions: int = 3

class QuizResponse(BaseModel):
    task_title: str
    questions: List[QuizQuestion]
    total_questions: int

@app.post("/generate-quiz", response_model=QuizResponse, summary="Generate Quiz for OnTrack Task")
async def generate_quiz_endpoint(request: QuizRequest):
    """
    Generate a multiple choice quiz based on an OnTrack task.
    """
    if not manager:
        raise HTTPException(
            status_code=503, 
            detail="System is initializing, please retry in a moment."
        )

    try:
        # Read the OnTrack task file
        task_file_path = f"./OnTrackTasks/{request.filename}"
        if not os.path.exists(task_file_path):
            raise HTTPException(status_code=404, detail=f"Task file not found: {request.filename}")
        
        with open(task_file_path, 'r', encoding='utf-8') as f:
            task_content = f.read()
        
        # Create questions based on task content analysis
        questions = []
        content_lower = task_content.lower()
        
        # Question 1: About objectives
        if "objectives" in content_lower or "goals" in content_lower:
            questions.append(QuizQuestion(
                question="What should the company objectives document include?",
                options=[
                    "Goals for the trimester and project basis",
                    "Individual student assignments", 
                    "Class schedule information",
                    "Grading criteria"
                ],
                correct_answer=0,
                explanation="The task requires documenting company objectives that provide goals for the trimester and basis for projects."
            ))
        
        # Question 2: About structure
        if "structure" in content_lower or "teams" in content_lower:
            questions.append(QuizQuestion(
                question="What does the company structure document outline?",
                options=[
                    "Team organization and responsibilities",
                    "Individual student grades",
                    "Course curriculum", 
                    "Assignment deadlines"
                ],
                correct_answer=0,
                explanation="Company structure outlines how teams are organized and their responsibilities."
            ))
        
        # Question 3: About submission
        if "submit" in content_lower or "upload" in content_lower:
            questions.append(QuizQuestion(
                question="How should the task be submitted?",
                options=[
                    "As a PDF file to OnTrack",
                    "As a Word document via email",
                    "As a printed document",
                    "As a PowerPoint presentation"
                ],
                correct_answer=0,
                explanation="The task requires saving to PDF and uploading to OnTrack."
            ))
        
        # Fill remaining questions if needed
        while len(questions) < request.num_questions:
            questions.append(QuizQuestion(
                question=f"What is a key requirement for the {request.task_title} task?",
                options=[
                    "Follow the specified format",
                    "Complete individual work",
                    "Attend all classes",
                    "Review other submissions"
                ],
                correct_answer=0,
                explanation="Following the specified format is a key requirement for most OnTrack tasks."
            ))
        
        # Ensure we have exactly the requested number
        questions = questions[:request.num_questions]
        
        return QuizResponse(
            task_title=request.task_title,
            questions=questions,
            total_questions=len(questions)
        )
        
    except Exception as e:
        log.error(f"Quiz generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate quiz")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)  # Using port 8002 to avoid conflicts