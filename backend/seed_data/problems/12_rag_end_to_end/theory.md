### The Unified RAG Pipeline
In production, a GenAI application coordinates multiple discrete subsystems:
1. **Ingestion & Parsing**: Transforming binary files (PDFs, DOCX) into clean text strings.
2. **Indexing**: Segmenting the text into chunks and converting them into dense semantic vectors using models like SentenceTransformers.
3. **Retrieval**: Performing nearest-neighbor searches in a vector store like FAISS to isolate the most relevant context.
4. **Generation**: Merging the retrieved context with the user query, and sending the compiled prompt to a Large Language Model (LLM) to generate a grounded, accurate response.