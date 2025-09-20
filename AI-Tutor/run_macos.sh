#!/bin/bash

# macOS Apple Silicon optimized startup script for AI Tutor RAG system

# Enable MPS fallback for PyTorch Metal Performance Shaders
export PYTORCH_ENABLE_MPS_FALLBACK=1
export PYTORCH_MPS_HIGH_WATERMARK_RATIO=0.0

# Ensure Ollama is running
if ! pgrep -x "ollama" > /dev/null; then
    echo "Starting Ollama service..."
    ollama serve &
    sleep 3
fi

# Check if phi3 model is available
if ! ollama list | grep -q "phi3"; then
    echo "Downloading phi3 model..."
    ollama pull phi3
fi

# Activate conda environment (if using conda)
# conda activate ai-tutor-apple-silicon

echo "Starting AI Tutor RAG system optimized for Apple Silicon M4 Max..."
echo "Using MPS acceleration for embeddings and Ollama for LLM inference"
echo "Available at http://localhost:8002"

# Start the RAG pipeline - using the Mac-compatible multi-turn version
python rag_multi_query_local.py