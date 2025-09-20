#!/usr/bin/env python3
"""
Debug script to check what's in the database and why search isn't working
"""

import torch
from sentence_transformers import SentenceTransformer
from langchain.embeddings.base import Embeddings
from langchain.vectorstores import Chroma
import sqlite3

class SentenceTransformerEmbeddings(Embeddings):
    def __init__(self, model_name="nomic-ai/nomic-embed-text-v1.5", device=None, batch_size=64):
        super().__init__()
        # Prioritize MPS for Apple Silicon
        if device is None:
            if torch.backends.mps.is_available():
                device = "mps"
            elif torch.cuda.is_available():
                device = "cuda"
            else:
                device = "cpu"
        
        self.device = device
        print(f"Using device: {self.device}")
        self.model = SentenceTransformer(model_name, trust_remote_code=True, device=self.device)
        self.batch_size = batch_size

    def embed_documents(self, texts):
        texts = ["search_document: " + i for i in texts]
        return self.model.encode(
            texts, 
            convert_to_numpy=True, 
            device=self.device, 
            batch_size=self.batch_size
        ).tolist()

    def embed_query(self, text):
        return self.model.encode(
            ['search_query: ' + text], 
            convert_to_numpy=True, 
            device=self.device
        )[0].tolist()

def check_database_contents():
    """Check what's actually stored in the ChromaDB"""
    print("=" * 60)
    print("🔍 CHECKING DATABASE CONTENTS")
    print("=" * 60)
    
    # Check SQLite database directly
    db_path = "./RL_db_reference_1k_500/chroma.sqlite3"
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get collections
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print(f"📊 Database tables: {[table[0] for table in tables]}")
        
        # Check collections table
        try:
            cursor.execute("SELECT * FROM collections;")
            collections = cursor.fetchall()
            print(f"📁 Collections: {len(collections)} found")
            for collection in collections:
                print(f"   Collection ID: {collection[0]}, Name: {collection[1] if len(collection) > 1 else 'N/A'}")
        except Exception as e:
            print(f"❌ Error reading collections: {e}")
        
        # Check if there are any embeddings
        try:
            cursor.execute("SELECT COUNT(*) FROM embeddings;")
            count = cursor.fetchone()[0]
            print(f"🧠 Total embeddings: {count}")
        except Exception as e:
            print(f"❌ Error counting embeddings: {e}")
            
        # Check if there are any documents
        try:
            cursor.execute("SELECT COUNT(*) FROM documents;")
            count = cursor.fetchone()[0]
            print(f"📄 Total documents: {count}")
        except Exception as e:
            print(f"❌ Error counting documents: {e}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error accessing database: {e}")

def test_vector_store():
    """Test the vector store with the same setup as your RAG system"""
    print("\n" + "=" * 60)
    print("🧪 TESTING VECTOR STORE")
    print("=" * 60)
    
    try:
        # Use the EXACT same setup as your rag_multi_query.py
        embeddings = SentenceTransformerEmbeddings()
        vectorstore = Chroma(
            persist_directory="./RL_db_reference_1k_500",
            embedding_function=embeddings
        )
        
        print("✅ Vector store loaded successfully")
        
        # Test different search queries
        test_queries = [
            "9.1P",
            "OnTrack task 9.1P", 
            "What's OnTrack task 9.1P about",
            "Update Your Company Mentor",
            "School of IT Capstone 9.1P",
            "capstone project",
            "company mentor",
            "Week 9"
        ]
        
        for query in test_queries:
            print(f"\n🔍 Testing query: '{query}'")
            try:
                docs = vectorstore.similarity_search(query, k=5)
                print(f"   📚 Found {len(docs)} documents")
                
                for i, doc in enumerate(docs, 1):
                    metadata = doc.metadata
                    source = metadata.get('source_file', metadata.get('source', 'Unknown'))
                    content_preview = doc.page_content[:100].replace('\n', ' ')
                    print(f"      {i}. {source}")
                    print(f"         Metadata: {metadata}")
                    print(f"         Content: \"{content_preview}...\"")
                    
            except Exception as e:
                print(f"   ❌ Error searching: {e}")
                
    except Exception as e:
        print(f"❌ Error loading vector store: {e}")

def check_raw_documents():
    """Check what documents were actually loaded"""
    print("\n" + "=" * 60)
    print("📄 CHECKING RAW DOCUMENTS")  
    print("=" * 60)
    
    try:
        embeddings = SentenceTransformerEmbeddings()
        vectorstore = Chroma(
            persist_directory="./RL_db_reference_1k_500",
            embedding_function=embeddings
        )
        
        # Get all documents using similarity search with a very broad query
        all_docs = vectorstore.similarity_search("", k=100)  # Get as many as possible
        
        print(f"📊 Total documents in database: {len(all_docs)}")
        
        # Group by source file
        source_files = {}
        for doc in all_docs:
            source = doc.metadata.get('source_file', doc.metadata.get('source', 'Unknown'))
            if source not in source_files:
                source_files[source] = []
            source_files[source].append(doc)
        
        print(f"📁 Unique source files: {len(source_files)}")
        for source, docs in source_files.items():
            print(f"   📄 {source}: {len(docs)} chunks")
            
        # Look specifically for 9.1P
        nine_one_p_docs = [doc for doc in all_docs if '9.1P' in str(doc.metadata) or '9.1P' in doc.page_content]
        print(f"\n🎯 Documents containing '9.1P': {len(nine_one_p_docs)}")
        for doc in nine_one_p_docs:
            print(f"   📄 Source: {doc.metadata.get('source_file', 'Unknown')}")
            print(f"   📝 Content: \"{doc.page_content[:200]}...\"")
            print(f"   🏷️  Metadata: {doc.metadata}")
            
    except Exception as e:
        print(f"❌ Error checking documents: {e}")

def main():
    print("🚀 DEBUGGING RAG DATABASE")
    print(f"📱 Using device: {'MPS' if torch.backends.mps.is_available() else 'CPU'}")
    
    check_database_contents()
    test_vector_store() 
    check_raw_documents()
    
    print("\n" + "=" * 60)
    print("✅ DEBUG COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    main()