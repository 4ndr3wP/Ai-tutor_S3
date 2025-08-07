# AI Tutor RAG System - Apple Silicon M4 Max Optimization

## Migration Summary

This document outlines the successful migration from NVIDIA CUDA to Apple Silicon M4 Max with 128GB unified memory.

## ✅ Completed Steps

### Step 1: Remove CUDA Configuration
- **Removed**: `os.environ["CUDA_VISIBLE_DEVICES"] = "0"`
- **Status**: ✅ Complete
- **Result**: No more CUDA device restrictions

### Step 2: Replace VLLM with Ollama
- **Changed**: VLLM → Ollama for better Apple Silicon support
- **Model**: Using `phi3` via Ollama (ready for `phi4` when available)
- **Configuration**:
  ```python
  self.llm = Ollama(
      model="phi3",
      temperature=0.1,
      num_ctx=8192,  # Context window optimized for M4 Max
  )
  ```
- **Status**: ✅ Complete and tested
- **Result**: Application successfully initializes and runs

### Step 3: Enable MPS Acceleration for Embeddings
- **Changed**: Device selection to prioritize MPS (Metal Performance Shaders)
- **Optimization**: Batch size increased from 64 to 256 for 128GB memory
- **Configuration**:
  ```python
  if torch.backends.mps.is_available():
      device = "mps"
  ```
- **Status**: ✅ Complete and working
- **Result**: Embeddings now run on Apple Silicon GPU (`#####Using device: mps`)

### Step 4: Environment Configuration Updates
- **Updated**: `environment.yml` optimized for Apple Silicon
- **Removed**: All NVIDIA CUDA packages
- **Added**: PyTorch with MPS support, conda-forge channel
- **Created**: `run_macos.sh` startup script with MPS environment variables
- **Status**: ✅ Complete

### Step 5: Frontend Configuration Updates
- **Changed**: API endpoint from `localhost:8000` to `localhost:8001`
- **Added**: API configuration abstraction in `lib/api.ts`
- **Optimized**: Extended timeout to 60 seconds for local LLM processing
- **Status**: ✅ Complete

## 🚀 Performance Optimizations for M4 Max

1. **MPS Acceleration**: Embeddings run on Apple Silicon GPU
2. **Increased Batch Size**: 256 (4x increase) to leverage 128GB unified memory
3. **Ollama Integration**: Native Apple Silicon LLM inference
4. **Extended Context**: 8192 tokens for comprehensive responses
5. **Optimized Memory Usage**: Unified memory architecture fully utilized

## 🏃‍♂️ How to Run

### Using the optimized startup script:
```bash
./run_macos.sh
```

### Manual startup:
```bash
# Ensure Ollama is running
ollama serve &

# Start the backend
python rag_single_query.py
# Backend will be available at http://localhost:8001

# In another terminal, start the frontend
cd AI-tutor-frontend/client
npm run dev
# Frontend will be available at http://localhost:5173
```

## 📊 Performance Comparison

| Component | Before (CUDA) | After (Apple Silicon) |
|-----------|---------------|----------------------|
| LLM Backend | VLLM | Ollama |
| Embeddings Device | CPU | MPS (Apple GPU) |
| Batch Size | 64 | 256 |
| Memory Architecture | GPU VRAM + RAM | 128GB Unified Memory |
| Port | 8000 | 8001 |

## 🔧 Key Configuration Files

- **Backend**: `rag_single_query.py` - Main RAG system
- **Environment**: `environment.yml` - Apple Silicon dependencies
- **Startup**: `run_macos.sh` - Optimized launch script
- **Frontend API**: `client/src/lib/api.ts` - API configuration

## 🎯 Next Steps (Optional Enhancements)

1. **Model Upgrade**: Switch to `phi4` when available on Ollama
2. **Memory Optimization**: Further increase batch sizes for even better performance
3. **Context Window**: Increase to 16K+ tokens for longer conversations
4. **Alternative Models**: Test with larger models (70B+) that fit in 128GB memory

## ✅ Verification Checklist

- [x] Application starts without CUDA errors
- [x] Ollama service integration working
- [x] MPS acceleration enabled for embeddings
- [x] Backend runs on port 8001
- [x] Frontend connects to new backend
- [x] All components successfully initialized
- [x] Ready for production use on Apple Silicon

## 🏆 Result

Your AI Tutor RAG system is now fully optimized for MacBook Pro M4 Max with 128GB unified memory, providing excellent performance without requiring NVIDIA CUDA infrastructure.
