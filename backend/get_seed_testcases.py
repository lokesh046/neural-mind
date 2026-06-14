import sys
import os
import base64
import io
import json
import math
import numpy as np

# Ensure backend imports work
sys.path.append(r"c:\Users\lokes\OneDrive\Desktop\tensortonic_clone\backend")

from rag_assets_data import PDF_BASE64, DOCX_BASE64, SAMPLE_TEXT
import pypdf
import docx
import faiss
from sentence_transformers import SentenceTransformer

def chunk_text(text, chunk_size, overlap):
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks

def run_reference_pipeline(file_content, file_type, query, chunk_size, overlap, k, system_template, max_chars):
    # 1. Ingest / Decode
    file_bytes = base64.b64decode(file_content)
    
    # 2. Parse
    if file_type == "pdf":
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
    elif file_type == "docx":
        doc = docx.Document(io.BytesIO(file_bytes))
        text = "\n".join([p.text for p in doc.paragraphs if p.text])
    else:
        text = ""
        
    # 3. Chunk
    chunks = chunk_text(text, chunk_size, overlap)
    
    # 4. Embeddings using SentenceTransformer
    model = SentenceTransformer('all-MiniLM-L6-v2')
    chunk_embs = model.encode(chunks, convert_to_numpy=True)
    query_emb = model.encode(query, convert_to_numpy=True)
    
    # 5. FAISS Vector Database
    D = chunk_embs.shape[1]
    index = faiss.IndexFlatL2(D)
    index.add(chunk_embs.astype(np.float32))
    
    # 6. Retrieve using L2 distance
    distances, indices = index.search(np.array([query_emb], dtype=np.float32), k)
    retrieved_indices = [int(idx) for idx in indices[0] if idx != -1]
    
    # 7. Prompt Budget compilation
    selected_chunks = []
    for idx in retrieved_indices:
        chunk = chunks[idx]
        candidate_chunks = selected_chunks + [chunk]
        context = "\n\n".join(candidate_chunks)
        prompt = system_template.format(context=context, query=query)
        if len(prompt) <= max_chars:
            selected_chunks.append(chunk)
        else:
            break
            
    context = "\n\n".join(selected_chunks)
    final_prompt = system_template.format(context=context, query=query)
    
    # Generate mock LLM response key
    response = f"LLM Response grounded on: {selected_chunks[0][:30]}..." if selected_chunks else "No context loaded"
    
    return {
        "text": text,
        "chunks": chunks,
        "retrieved_indices": retrieved_indices,
        "prompt": final_prompt,
        "response": response
    }

def main():
    print("=== Generating test cases for Challenge 12 (PDF) ===")
    pdf_res = run_reference_pipeline(
        file_content=PDF_BASE64,
        file_type="pdf",
        query="ingestion layer",
        chunk_size=120,
        overlap=30,
        k=2,
        system_template="Context:\n{context}\n\nQuery: {query}",
        max_chars=350
    )
    print("PDF Result Prompt:\n", pdf_res["prompt"])
    print("PDF Result Response:\n", pdf_res["response"])
    print("PDF EXPECTED JSON:")
    print(json.dumps(pdf_res, indent=2))
    
    print("\n=== Generating test cases for Challenge 12 (DOCX) ===")
    docx_res = run_reference_pipeline(
        file_content=DOCX_BASE64,
        file_type="docx",
        query="FAISS vector store",
        chunk_size=120,
        overlap=30,
        k=2,
        system_template="Context:\n{context}\n\nQuery: {query}",
        max_chars=350
    )
    print("DOCX Result Prompt:\n", docx_res["prompt"])
    print("DOCX Result Response:\n", docx_res["response"])
    print("DOCX EXPECTED JSON:")
    print(json.dumps(docx_res, indent=2))

if __name__ == "__main__":
    main()
