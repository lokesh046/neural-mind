Implement the complete Ingestion-to-Generation RAG pipeline matching the full architecture:
`Ingestion (PDF/Word) -> Parsing -> Chunking -> Embedding -> FAISS Vector DB -> Retrieval -> Prompt Assembly -> LLM Output`

### Task
Implement `run_rag_pipeline`. The input file will be passed as a base64 encoded string.

### Steps
1. **Decode Ingestion**: Decode the base64-encoded `file_content` into raw bytes.
2. **Parse Document**:
   - If `file_type == "pdf"`, use `pypdf.PdfReader` to extract the plain text of all pages.
   - If `file_type == "docx"`, use `docx.Document` to extract text from all paragraphs and join them with a single newline `\n`.
3. **Chunk Text**: Split the parsed plain text into chunks using fixed-size sliding-window chunking (with `overlap` and `chunk_size` characters).
4. **Generate Embeddings**: Use `SentenceTransformer('all-MiniLM-L6-v2')` to generate embedding vectors for all text chunks and the `query`.
5. **FAISS Vector DB**: Build a flat L2 index (`faiss.IndexFlatL2`), load the chunk embeddings (as `np.float32`), and query it with the query embedding to retrieve the top `k` closest chunk indices.
6. **Compile Prompt**: Pack the retrieved chunks into `system_template` within the `max_chars` budget. Chunks are added one by one in the order returned by FAISS. If adding a chunk causes the formatted prompt length to exceed `max_chars`, stop adding chunks. If no chunks can be added, context is `""`.
7. **Query LLM**: Query the mock LLM by looking up the final prompt in `llm_response_map`. If the prompt is not present in the map, default to `f"LLM Response grounded on: {selected_chunks[0][:30]}..."` (if chunks are selected) or `"No context loaded"` (if no chunks are selected).
8. **Return**: A dictionary containing the stage variables.