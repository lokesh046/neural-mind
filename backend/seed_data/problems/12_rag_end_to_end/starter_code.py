import base64
import io
import numpy as np
import pypdf
import docx
import faiss
from sentence_transformers import SentenceTransformer

def run_rag_pipeline(file_content, file_type, query, chunk_size, overlap, k, system_template, max_chars, llm_response_map):
    """
    Ingest, parse, chunk, embed, index, retrieve, compile and query LLM.
    Returns:
        dict with keys: 'text', 'chunks', 'retrieved_indices', 'prompt', 'response'
    """
    # Write your code here
    pass
