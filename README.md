## 🧠 AI-Tutor
AI-Tutor is a RAG (Retrieval-Augmented Generation) pipeline designed to turn unstructured document collections into intelligent, queryable knowledge systems. It leverages modern LLM tooling for smart document ingestion, indexing, and frontend integration.


## 📦 Prerequisites
Before running the project, make sure the following dependencies are installed:


- Python 3.x
- Docling
- ChromaDB

## ⚙️ How It Works
* Document Conversion
    - Input documents (in various formats) are parsed and converted into markdown files using Docling.

* Vector DB Construction
    - These markdown files are embedded and stored in a ChromaDB vector database.

* RAG Application
    - A LangChain-based pipeline is built to query the vector store using LLMs for intelligent response generation.

* API Integration
    - A Flask API wraps the backend logic for integration with the frontend application.

Architecture Overview
* **Overall architecture** 
![alt text](AI-Tutor/rag_pipline.png)



## 📁 Project Structure
```
AI-Tutor/
│
├── AI-Tutor/               # Backend logic and RAG pipeline
│   ├── docling_run.py
│   └── rag_single_query.py
│
├── AI-tutor-frontend/      # Frontend client
    └── client/
```

## 🚀 Setup Instructions

```# Navigate to backend directory
cd AI-Tutor

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Runing RAG pipline 

```
python rag_single_query.py
```


## 🌐 Frontend Setup


* Install [Nodejs](https://nodejs.org/en/download) 
* Navigate to the client directory


```
cd AI-tutor-frontend/client

```
* Start the frontend



```
npm run dev

```

### Set API Endpoint
- Open src/App.tsx and update the API endpoint to match your Flask backend URL. Change the existed URL to the new URL of allocated GPU Node.
    
```
        const res = await axios.post("http://10.72.191.93:8000/query",

```




