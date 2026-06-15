Implement the Embedding layer of a RAG pipeline using the **SentenceTransformers** library.

Given a list of text `chunks` and a `query` string, use `SentenceTransformer('all-MiniLM-L6-v2')` to generate dense vector embeddings.

Return a dictionary containing the query embedding (1D list of floats) and the chunk embeddings (2D list of floats):
```python
{
    "query_embedding": query_emb, # List[float]
    "chunk_embeddings": chunk_embs # List[List[float]]
}
```