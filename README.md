## 🧠 AI-Tutor
AI-Tutor is a RAG (Retrieval-Augmented Generation) pipeline designed to turn unstructured document collections into intelligent, queryable knowledge systems. It leverages modern LLM tooling for smart document ingestion, indexing, and frontend integration.

## 📦 Prerequisites
Before running the project, make sure the following dependencies are installed:

- Python 3.10+
- Node.js (for frontend)
- Ollama (for local LLM inference)
- Conda (for environment management)

## ⚙️ How It Works
* Document Conversion
    - Input documents (in various formats) are parsed and converted into markdown files using Docling.

* Vector DB Construction
    - These markdown files are embedded and stored in a ChromaDB vector database.

* RAG Application
    - A LangChain-based pipeline is built to query the vector store using LLMs for intelligent response generation.

* API Integration
    - A FastAPI backend wraps the RAG logic for integration with the React frontend application.

Architecture Overview
* **Overall architecture** 
![alt text](AI-Tutor/rag_pipline.png)

## 📁 Project Structure
```
AI-Tutor/
│
├── AI-Tutor/               # Backend logic and RAG pipeline
│   ├── docling_run.py
│   ├── rag_single_query.py
│   └── environment.yml
│
├── AI-tutor-frontend/      # Frontend client
    └── client/
```

## 🚀 Complete Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd AI-Tutor
   ```

2. **Create and activate conda environment:**
   ```bash
   conda env create -f environment.yml
   conda activate ai-tutor-apple-silicon
   ```

3. **Install additional required packages:**
   ```bash
   pip install einops langchain-ollama
   ```

4. **Install and start Ollama:**
   ```bash
   # Install Ollama (if not already installed)
   brew install ollama
   
   # Start Ollama service
   ollama serve &
   
   # Download the required model
   ollama pull phi3
   ```

5. **Start the backend:**
   ```bash
   # Option 1: Use the optimized startup script
   ./run_macos.sh
   
   # Option 2: Run directly
   python rag_single_query.py
   ```
   
   The backend will be available at `http://localhost:8001`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd AI-tutor-frontend/client
   ```

2. **Clean and install dependencies:**
   ```bash
   # Clean any existing installation
   rm -rf node_modules package-lock.json
   
   # Install dependencies
   npm install
   ```

3. **Start the frontend:**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:5001` (or another port if 5001 is in use)

## 🌐 Access the Application

- **Frontend**: `http://localhost:5001` (or check terminal for actual port)
- **Backend API**: `http://localhost:8001`
- **API Documentation**: `http://localhost:8001/docs`

## 🎯 Features

- **Apple Silicon Optimized**: Uses MPS (Metal Performance Shaders) for GPU acceleration
- **Local LLM**: Uses Ollama with phi3 model for privacy and offline operation
- **RAG Pipeline**: Queries a pre-built vector database of educational content
- **Modern UI**: React + TypeScript frontend with Tailwind CSS
- **Real-time Chat**: Interactive chat interface for educational queries

## 📄 Notes

- The system is optimized for Apple Silicon Macs with MPS acceleration
- Backend runs on port 8001 (not 8000) as per Apple Silicon migration
- Frontend automatically finds available ports starting from 5000
- All dependencies are managed through conda and npm



