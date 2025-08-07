#!/usr/bin/env python3
"""
Data Ingestion Script for AI Tutor RAG System
Populates ChromaDB with course materials from grouped_weeks/ folder
Optimized for Apple Silicon M4 Max with MPS acceleration
"""

import os
import glob
import re
from pathlib import Path
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.schema import Document
from rag_single_query import SentenceTransformerEmbeddings, EMBEDDING_MODEL, BATCH_SIZE
import torch

# Configuration
CONTENT_DIR = "./OnTrackTasks"
PERSIST_DIR = "./RL_db_reference_1k_500"
CHUNK_SIZE = 1000  # Size of text chunks
CHUNK_OVERLAP = 200  # Overlap between chunks

def extract_week_number(file_path):
    """Extract task/assignment number from OnTrack file path"""
    # Look for patterns like "2.1P", "4.2D", "10.1P" etc.
    task_match = re.search(r'(\d+)\.(\d+)[A-Z]+', file_path)
    if task_match:
        week_num = task_match.group(1)
        task_num = task_match.group(2)
        return f"week{week_num.zfill(2)}_task{task_num}"
    
    # Fallback to week pattern
    week_match = re.search(r'week(\d+)', file_path.lower())
    if week_match:
        return f"week{week_match.group(1).zfill(2)}"
    
    return "unknown"

def load_documents():
    """Load all markdown documents from the OnTrackTasks directory"""
    documents = []
    
    # Get all markdown files recursively
    md_files = glob.glob(os.path.join(CONTENT_DIR, "**/*.md"), recursive=True)
    
    print(f"📁 Found {len(md_files)} markdown files in OnTrackTasks")
    
    for file_path in md_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
                
            # Skip empty files
            if not content.strip():
                print(f"⚠️  Skipping empty file: {file_path}")
                continue
                
            # Extract metadata
            week = extract_week_number(file_path)
            filename = os.path.basename(file_path)
            
            # Determine if it's a task sheet or submission
            doc_type = "submission" if "submission" in filename.lower() else "task_sheet"
            
            # Create document with metadata
            doc = Document(
                page_content=content,
                metadata={
                    "source_file": filename,
                    "full_path": file_path,
                    "week": week,
                    "file_type": "markdown",
                    "doc_type": doc_type
                }
            )
            
            documents.append(doc)
            print(f"✅ Loaded: {filename} (Week: {week}, {len(content)} chars)")
            
        except Exception as e:
            print(f"❌ Error loading {file_path}: {e}")
    
    print(f"\n📊 Total documents loaded: {len(documents)}")
    return documents

def split_documents(documents):
    """Split documents into smaller chunks for better retrieval"""
    print(f"\n🔪 Splitting documents into chunks...")
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
        length_function=len,
    )
    
    chunks = []
    for doc in documents:
        # Split the document
        doc_chunks = text_splitter.split_documents([doc])
        
        # Add chunk index to metadata
        for i, chunk in enumerate(doc_chunks):
            chunk.metadata["chunk_id"] = i
            chunk.metadata["total_chunks"] = len(doc_chunks)
            chunks.append(chunk)
        
        print(f"📄 {doc.metadata['source_file']}: {len(doc_chunks)} chunks")
    
    print(f"\n📈 Total chunks created: {len(chunks)}")
    return chunks

def create_vector_store(chunks):
    """Create ChromaDB vector store with embeddings"""
    print(f"\n🧠 Creating embeddings and storing in ChromaDB...")
    print(f"📍 Database location: {PERSIST_DIR}")
    print(f"🔢 Using model: {EMBEDDING_MODEL}")
    print(f"📦 Batch size: {BATCH_SIZE}")
    
    # Initialize embeddings with MPS optimization
    embeddings = SentenceTransformerEmbeddings(batch_size=BATCH_SIZE)
    
    # Create vector store
    print(f"⚡ Processing {len(chunks)} chunks...")
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=PERSIST_DIR
    )
    
    # Persist the database
    vectorstore.persist()
    print(f"💾 Database persisted to {PERSIST_DIR}")
    
    return vectorstore

def test_retrieval(vectorstore):
    """Test the vector store with a sample query"""
    print(f"\n🧪 Testing retrieval with sample queries...")
    
    test_queries = [
        "What are the company objectives?",
        "What is reinforcement learning?",
        "What are the OnTrack tasks?",
        "What assignments do I need to complete?",
        "Tell me about the project requirements"
    ]
    
    for query in test_queries:
        print(f"\n🔍 Query: '{query}'")
        docs = vectorstore.similarity_search(query, k=3)
        print(f"📚 Found {len(docs)} relevant documents:")
        
        for i, doc in enumerate(docs, 1):
            week = doc.metadata.get('week', 'Unknown')
            source = doc.metadata.get('source_file', 'Unknown')
            content_preview = doc.page_content[:100].replace('\n', ' ')
            print(f"  {i}. Week {week} - {source}")
            print(f"     \"{content_preview}...\"")

def main():
    """Main ingestion pipeline"""
    print("🚀 Starting AI Tutor Data Ingestion Pipeline")
    print(f"📱 Using device: {'MPS' if torch.backends.mps.is_available() else 'CPU'}")
    print("=" * 60)
    
    # Step 1: Load documents
    documents = load_documents()
    if not documents:
        print("❌ No documents found! Check the OnTrackTasks directory.")
        return
    
    # Step 2: Split into chunks
    chunks = split_documents(documents)
    
    # Step 3: Create vector store
    vectorstore = create_vector_store(chunks)
    
    # Step 4: Test retrieval
    test_retrieval(vectorstore)
    
    print("\n" + "=" * 60)
    print("✅ Data ingestion completed successfully!")
    print(f"📊 Total documents processed: {len(documents)}")
    print(f"📈 Total chunks stored: {len(chunks)}")
    print(f"💾 Database location: {PERSIST_DIR}")
    print("\n🎯 Your RAG system is now ready to use!")

if __name__ == "__main__":
    main()
