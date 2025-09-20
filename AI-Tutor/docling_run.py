import sys
# sys.path.append('/vast/s223795137/Crawl_data/High_cluster_deployment/AI-Tutor/docling/docling')
import argparse
import glob
import os
from pathlib import Path
# from docling.datamodel.base_models import InputFormat
from docling.document_converter import DocumentConverter
from docling.datamodel.pipeline_options import (
    PdfPipelineOptions,
    TesseractCliOcrOptions,
)
from docling.document_converter import (
    DocumentConverter,
    PdfFormatOption,
    WordFormatOption,
)
from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions
from docling.document_converter import DocumentConverter, PdfFormatOption

from docling.pipeline.simple_pipeline import SimplePipeline
from docling.pipeline.standard_pdf_pipeline import StandardPdfPipeline
from langchain_community.document_loaders import DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from langchain.embeddings.base import Embeddings
import torch
from langchain_chroma import Chroma

# Argument Parser
parser = argparse.ArgumentParser(description="Convert documents to text and store in Chroma DB")
parser.add_argument("--input-directory", type=str, required=True, help="Directory containing documents")
parser.add_argument("--vector_db", type=str, default="vector_db", help="Directory for storing vector database")
args = parser.parse_args()

directory_path = args.input_directory
OUTPUT_DIR =Path(args.vector_db)
VECTOR_DATABASE = Path(args.vector_db)

IMAGE_RESOLUTION_SCALE = 2.0

pipeline_options = PdfPipelineOptions()
pipeline_options.images_scale = IMAGE_RESOLUTION_SCALE
pipeline_options.generate_page_images = True
pipeline_options.generate_picture_images = True
pipeline_options.do_ocr = True
ocr_options = TesseractCliOcrOptions(force_full_page_ocr=True)
pipeline_options.ocr_options = ocr_options

file_patterns = ['*.txt', '*.html', '*.docx', '*.pdf', '*.md']  # Added .md files
embedding_batch_size = 64

# List to store all the files
all_files = []

# Loop through each pattern and retrieve matching files
for pattern in file_patterns:
    files = glob.glob(os.path.join(directory_path, '**', pattern), recursive=True)
    all_files.extend(files)

input_paths = all_files

# Initialize DocumentConverter for supported formats
doc_converter = DocumentConverter(
    format_options={
        InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options)
    }
)

def process_text_file(file_path: str) -> dict:
    """Process a .txt or .md file and return a simple result structure."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return {
            "status": "success",
            "filename": Path(file_path).name,
            "document": content
        }
    except Exception as e:
        return {
            "status": "failed",
            "filename": Path(file_path).name,
            "error": str(e)
        }

txt_files = [f for f in input_paths if f.lower().endswith(('.txt', '.md'))]  # Include .md files
non_txt_files = [f for f in input_paths if not f.lower().endswith(('.txt', '.md'))]

conv_results = []
if non_txt_files:
    conv_results.extend(doc_converter.convert_all(non_txt_files))

for txt_file in txt_files:
    txt_result = process_text_file(txt_file)
    conv_results.append(txt_result)

def save_converted_data(docs, output_dir):
    output_dir.mkdir(parents=True, exist_ok=True)
    for doc in docs:
        if isinstance(doc, dict):
            with (output_dir / f"{doc['filename']}.md").open("w") as fp:
                fp.write(doc['document'])
        else:
            with (output_dir / f"{doc.input.file.stem}.md").open("w",encoding="utf-8") as fp:
                fp.write(doc.document.export_to_markdown())

save_converted_data(conv_results, OUTPUT_DIR)

### The following code is doing the vectorization and storing in Chroma DB
# UNCOMMENTED AND MODIFIED FOR YOUR SETUP

loader = DirectoryLoader(OUTPUT_DIR, glob="*.md")
documents = loader.load()

# Add metadata to documents
for doc in documents:
    # Extract week/task info from filename
    filename = doc.metadata.get('source', '').split('/')[-1]
    if 'OnTrack' in filename:
        # Extract task number like "2.1P", "9.1P", etc.
        import re
        task_match = re.search(r'(\d+)\.(\d+)[A-Z]+', filename)
        if task_match:
            week_num = task_match.group(1)
            task_num = task_match.group(2)
            doc.metadata['week'] = f"week{week_num.zfill(2)}_task{task_num}"
        else:
            doc.metadata['week'] = "unknown"
        
        # Determine if it's a task sheet or submission
        if 'submission' in filename.lower():
            doc.metadata['doc_type'] = 'submission'
        else:
            doc.metadata['doc_type'] = 'task_sheet'
    else:
        doc.metadata['week'] = "unknown"
        doc.metadata['doc_type'] = "other"

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
all_splits = text_splitter.split_documents(documents)

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
        texts = ["search_document: "+i for i in texts]
        return self.model.encode(
            texts, 
            convert_to_numpy=True, 
            device=self.device, 
            batch_size=self.batch_size
        ).tolist()

    def embed_query(self, text):
        return self.model.encode(
            ['search_query: '+text], 
            convert_to_numpy=True, 
            device=self.device
        )[0].tolist()

print("Creating embeddings and vector store...")
local_embeddings = SentenceTransformerEmbeddings(batch_size=64)
VECTOR_DATABASE.mkdir(parents=True, exist_ok=True)
vectorstore = Chroma.from_documents(documents=all_splits, embedding=local_embeddings, persist_directory=str(VECTOR_DATABASE))

print(f"Vector store created with {len(all_splits)} chunks")
print(f"Database saved to: {VECTOR_DATABASE}")