### Flat L2 Indexing in FAISS
FAISS provides multiple index types. The simplest is **IndexFlatL2**, which performs exact nearest-neighbor search by computing L2 (Euclidean) distances between vectors.

A flat index is highly accurate because it performs exact nearest neighbor queries. For very large datasets, FAISS supports approximate nearest neighbor (ANN) indices (like IVF, HNSW) to trade a small amount of accuracy for orders-of-magnitude speedups.