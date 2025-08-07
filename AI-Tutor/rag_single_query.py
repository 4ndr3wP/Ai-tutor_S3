from fastapi import FastAPI
from pydantic import BaseModel
import datetime
import json
import os
import numpy as np
# from sklearn.metrics.pairwise import cosine_similarity
from langchain import LLMChain, PromptTemplate
from langchain.chains import StuffDocumentsChain , RetrievalQA
from langchain.vectorstores import Chroma
from sentence_transformers import SentenceTransformer
from langchain.embeddings.base import Embeddings
import torch
from langchain_community.llms import Ollama
from fastapi.middleware.cors import CORSMiddleware
import logging
from collections import Counter
import threading
import uuid
from fastapi import FastAPI, Request



MODEL_NAME = 'microsoft/phi-4'
EMBEDDING_MODEL = 'nomic-ai/nomic-embed-text-v1.5'
SIMILARITY_THRESHOLD = 0.55
BATCH_SIZE = 256  # Increased from 64 to leverage 128GB unified memory

# Single-query RAG prompt: no conversation history
# RAG_TEMPLATE = """
# <|im_start|>system<|im_sep|>
# You are an AI agent designed to assist with Unit-related topics. You will be provided with context documents and a student question.

# 1. Respond ONLY with reflective questions, concise summaries, and hints to encourage critical thinking.
# 2. Suggest relevant slides or weeks without revealing full content.
# 3. Stay supportive, motivational, and within the scope of Deakin Unit topics.
# 4. If malicious or sensitive, do not respond.

# <|im_start|>user<|im_sep|>
# Context:
# {context}

# Question:
# {question}

# Answer:
# <|im_start|>assistant<|im_sep|>
# """

RAG_TEMPLATE = """
<|im_start|>system<|im_sep|>
You are an AI tutor assisting with university unit content. You will be given course context and a student question.

1. Use only the context to answer factually and clearly.
2. Stay concise and on-topic.
3. If the question is outside the context, Give an overview answer about the topic."
4. Do not make up information. Avoid opinions and unnecessary elaboration.
5. If malicious or sensitive, do not respond.
6. After the answer, provide a list of relevant weeks or slides from the course material for example.\n Related material: [week 1, week 2, week 3].

<|im_start|>user<|im_sep|>
Context:
{context}

Question:
{question}

Answer:
<|im_start|>assistant<|im_sep|>
"""


class SentenceTransformerEmbeddings(Embeddings):
    def __init__(self, model_name=EMBEDDING_MODEL, device=None, batch_size=BATCH_SIZE):
        
        super().__init__()
        # Prioritize MPS (Metal Performance Shaders) for Apple Silicon, then CUDA, then CPU
        if device is None:
            if torch.backends.mps.is_available():
                device = "mps"
            elif torch.cuda.is_available():
                device = "cuda"
            else:
                device = "cpu"
        
        self.device = device
        print(f"#####Using device: {self.device}")
        self.model = SentenceTransformer(model_name, trust_remote_code=True, device=self.device)
        self.batch_size = batch_size

    def embed_documents(self, texts):
        texts = ["search_document: " + i for i in texts]
        return self.model.encode(texts, convert_to_numpy=True, device=self.device, batch_size=self.batch_size).tolist()

    def embed_query(self, text):
        return self.model.encode(['search_query: ' + text], convert_to_numpy=True, device=self.device)[0].tolist()

class RAGSystemSingle:
    def __init__(self):
        PERSIST_DIR = './RL_db_reference_1k_500'
        self.llm = Ollama(
            model="phi3",  # Using phi3 until phi4 is available on Ollama
            temperature=0.1,
            num_ctx=8192,  # Context window size
        )
        self.embeddings = SentenceTransformerEmbeddings(batch_size=BATCH_SIZE)
        self.vectorstore = Chroma(persist_directory=PERSIST_DIR,
                                  embedding_function=self.embeddings)

        # Prompt with only context and question
        self.prompt = PromptTemplate(
            input_variables=["context", "question"],
            template=RAG_TEMPLATE
        )

        self.llm_chain = LLMChain(llm=self.llm, prompt=self.prompt)

        self.stuff_chain = StuffDocumentsChain(
            llm_chain=self.llm_chain,
            document_variable_name="context"
        )

    def calculate_query_doc_similarity(self, query, docs):
        q_emb = np.array(self.embeddings.embed_query(query)).reshape(1, -1)
        d_embs = np.vstack([self.embeddings.embed_query(d.page_content) for d in docs])
        sims = cosine_similarity(q_emb, d_embs)[0]
        top2 = np.sort(sims)[::-1][:2]
        avg = float(np.mean(sims)) if sims.size else 0.0
        return top2, avg

    def query(self, question, k=5 , session_id=None):
        
        retriever = self.vectorstore.as_retriever(search_kwargs={"k": k})

        docs = retriever.get_relevant_documents(question)
        # context = "\n\n".join([d.page_content for d in docs])
        # Run RAG chain

        rag_chain = RetrievalQA(
            retriever=retriever,
            combine_documents_chain=self.stuff_chain
        )
        response = rag_chain.run(question)

        # Similarity metrics
        # print("docs:",  [i.metadata['source_file'] for i in docs])
        # print("response:", response)
        # top2, avg = self.calculate_query_doc_similarity(question, docs)

        # # Add references if above threshold
        # # titles = sorted({d.metadata['source'].split('/')[-1].split('_')[0] for d in docs})
        # print("docs:",  [i.metadata for i in docs])
        # titles = [i.metadata['week'] for i in docs]

        # print(titles)

        # Get the most common elements
        
        # if avg >= SIMILARITY_THRESHOLD and titles:

        # refs = "\n\nReferences:\n" + "\n".join(f"- {t}" for t in titles)
        # response += refs

        self.log_interaction(question, response, session_id)
        return response
    

    def log_interaction(self, query, response,session_id, filename="chat_history.json"):
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

# FastAPI setup

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn.error")



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str
    k: int = 25
    session_id: str

class QueryResponse(BaseModel):
    response: str
    session_id:str

@app.on_event("startup")
def startup_event():
    try:
        app.state.rag_system = RAGSystemSingle()
    except Exception:
        logger.error("Failed to init RAGSystemSingle", exc_info=True)
        raise


@app.post("/query", response_model=QueryResponse)
def query_rag(request: QueryRequest, http_request: Request):
    try:
        session_id = request.session_id or http_request.cookies.get("session_id") or str(uuid.uuid4())
        response = app.state.rag_system.query(
            request.query, request.k, session_id
        )
        http_response = QueryResponse(response=response, session_id=session_id)
        if not request.session_id and not http_request.cookies.get("session_id"):
            http_response.set_cookie(key="session_id", value=session_id)
        return http_response
    except Exception as e:
        logger.error(f"Error during query processing: {str(e)}", exc_info=True)
        raise

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)  # Using port 8001 to avoid conflict
