Implement the Retrieval layer of a RAG pipeline using **FAISS**.

Given a query embedding `query_emb` (1D list of floats), a list of document embeddings `doc_embs` (2D list of floats), and an integer `k`, build a FAISS flat L2 index, add the document vectors, and query the index to retrieve the indices of the `k` closest documents.

### Steps
1. Convert `doc_embs` to a 2D numpy array of type `np.float32`.
2. Convert `query_emb` to a 2D numpy array of type `np.float32` and shape `(1, D)`.
3. Create a flat L2 index: `index = faiss.IndexFlatL2(D)`.
4. Add the document embeddings array to the index.
5. Search the index with the query embedding array for the `k` nearest neighbors using `distances, indices = index.search(query_emb_np, k)`.
6. Return the indices of the closest documents as a list of integers (extract from the 2D indices array).