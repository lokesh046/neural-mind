### Semantic Embeddings with SentenceTransformers
Computers cannot natively read plain text. To match semantic queries with documents, text must be translated into high-dimensional vectors representing meaning.

**SentenceTransformers** is a Python framework that uses pre-trained Transformer models (like BERT or MiniLM) to map text to a dense vector space, allowing similar text segments to lie close together in Euclidean or Cosine distance.