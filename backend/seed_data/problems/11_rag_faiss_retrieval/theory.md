### Querying a FAISS L2 Index
Once embeddings are stored in a FAISS index, we query it using the query vector. The L2 index calculates the Euclidean distance:
$$d(q, x) = \sum_{i=1}^D (q_i - x_i)^2$$
And returns the indices of the closest document vectors, sorted from smallest distance to largest.