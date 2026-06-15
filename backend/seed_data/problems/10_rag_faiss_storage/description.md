Implement the Vector Database Storage layer of a RAG pipeline using **FAISS**.

Given a list of lists of floats representing document `embeddings`, build a FAISS flat L2 index and load the embeddings into it.

### Steps
1. Convert the input `embeddings` to a 2D numpy array of type `np.float32`.
2. Determine the vector dimension $D$ (length of each embedding).
3. Initialize a flat L2 index: `index = faiss.IndexFlatL2(D)`.
4. Add the embeddings array to the index.
5. Return a dictionary containing the total number of indexed vectors (`ntotal`) and the index dimension (`dimension`):
```python
{
    "ntotal": index.ntotal,
    "dimension": index.d
}
```