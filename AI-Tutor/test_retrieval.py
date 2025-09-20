#!/usr/bin/env python3
"""
Test script to debug why 9.1P is not being retrieved correctly
"""

import torch
from sentence_transformers import SentenceTransformer
from langchain.embeddings.base import Embeddings
from langchain.vectorstores import Chroma

class SentenceTransformerEmbeddings(Embeddings):
    def __init__(self, model_name="nomic-ai/nomic-embed-text-v1.5", device=None, batch_size=64):
        super().__init__()
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
        return self.model.encode(texts, convert_to_numpy=True, device=self.device, batch_size=self.batch_size).tolist()

    def embed_query(self, text):
        return self.model.encode(['search_query: ' + text], convert_to_numpy=True, device=self.device)[0].tolist()

def test_specific_queries():
    """Test various queries to see which ones find 9.1P"""
    print("=" * 60)
    print("🔍 TESTING SPECIFIC QUERIES FOR 9.1P")
    print("=" * 60)
    
    embeddings = SentenceTransformerEmbeddings()
    vectorstore = Chroma(
        persist_directory="./RL_db_reference_1k_500",
        embedding_function=embeddings
    )
    
    # Test different query variations
    test_queries = [
        "What's OnTrack task 9.1P about?",
        "OnTrack task 9.1P",
        "9.1P",
        "task 9.1P",
        "9.1P OnTrack",
        "Update Your Company Mentor",
        "School of IT Capstone 9.1P",
        "Week 9 task",
        "9.1P task sheet",
        "capstone 9.1P"
    ]
    
    for query in test_queries:
        print(f"\n🔍 Query: '{query}'")
        docs = vectorstore.similarity_search(query, k=5)
        
        # Check if 9.1P is in the results
        nine_one_p_found = any('9.1P' in doc.metadata.get('source_file', '') for doc in docs)
        
        print(f"   📚 Found {len(docs)} documents")
        print(f"   🎯 9.1P found: {'✅ YES' if nine_one_p_found else '❌ NO'}")
        
        for i, doc in enumerate(docs, 1):
            source_file = doc.metadata.get('source_file', 'Unknown')
            content_preview = doc.page_content[:80].replace('\n', ' ')
            print(f"      {i}. {source_file}")
            print(f"         \"{content_preview}...\"")

def test_embedding_similarity():
    """Test the actual embedding similarity scores"""
    print("\n" + "=" * 60)
    print("🧮 TESTING EMBEDDING SIMILARITY SCORES")
    print("=" * 60)
    
    embeddings = SentenceTransformerEmbeddings()
    vectorstore = Chroma(
        persist_directory="./RL_db_reference_1k_500",
        embedding_function=embeddings
    )
    
    # Get the 9.1P document specifically
    nine_one_p_docs = vectorstore.similarity_search("9.1P", k=10)
    nine_one_p_doc = None
    for doc in nine_one_p_docs:
        if '9.1P' in doc.metadata.get('source_file', ''):
            nine_one_p_doc = doc
            break
    
    if not nine_one_p_doc:
        print("❌ Could not find 9.1P document!")
        return
    
    print(f"✅ Found 9.1P document: {nine_one_p_doc.metadata.get('source_file')}")
    print(f"📝 Content: \"{nine_one_p_doc.page_content[:100]}...\"")
    
    # Test different queries against this document
    test_queries = [
        "What's OnTrack task 9.1P about?",
        "OnTrack task 9.1P", 
        "9.1P",
        "Update Your Company Mentor"
    ]
    
    for query in test_queries:
        print(f"\n🔍 Testing query: '{query}'")
        
        # Get query embedding
        query_embedding = embeddings.embed_query(query)
        
        # Get document embedding  
        doc_embedding = embeddings.embed_query(nine_one_p_doc.page_content)
        
        # Calculate cosine similarity manually
        import numpy as np
        similarity = np.dot(query_embedding, doc_embedding) / (np.linalg.norm(query_embedding) * np.linalg.norm(doc_embedding))
        print(f"   📊 Similarity score: {similarity:.4f}")

def main():
    print("�� DEBUGGING 9.1P RETRIEVAL ISSUE")
    print(f"📱 Using device: {'MPS' if torch.backends.mps.is_available() else 'CPU'}")
    
    test_specific_queries()
    test_embedding_similarity()
    
    print("\n" + "=" * 60)
    print("✅ DEBUG COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    main()