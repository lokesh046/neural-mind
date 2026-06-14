import json
import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, SessionLocal, engine
from app import models

# Ensure backend folder is on search path for relative imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from rag_assets_data import PDF_BASE64, DOCX_BASE64

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Clear existing problems to avoid duplicates on re-run
        db.query(models.TestCase).delete()
        db.query(models.Problem).delete()
        db.commit()
        print("Cleared existing problems and test cases.")
        
        # 1. Positional Encoding
        pe_desc = """Implement sinusoidal positional encodings as described in **"Attention Is All You Need"** to inject sequence order into token embeddings.

Given a sequence length `seq_len` and model dimension `d_model`, compute the positional encoding matrix using the sine and cosine formulation.

### Mathematical Formulation
For a position $pos$ and dimension index $i$:

$$PE(pos, 2i) = \\sin\\left(\\frac{pos}{base^{\\frac{2i}{d_{model}}}}\\right)$$
$$PE(pos, 2i+1) = \\cos\\left(\\frac{pos}{base^{\\frac{2i}{d_{model}}}}\\right)$$

Where $base = 10000.0$ by default.

Even-indexed columns use sine, odd-indexed columns use cosine, and the frequency decreases with the dimension index."""

        pe_theory = """### Positional Encoding in Transformers
Unlike Recurrent Neural Networks (RNNs) or Convolutional Neural Networks (CNNs), which naturally process tokens sequentially, Self-Attention networks are permutation-invariant. This means they process all tokens in parallel and do not inherently know their order.

To solve this, the authors of the Transformer paper introduced **Positional Encodings** ($PE$). These encodings have the same dimension as the token embeddings, so they can be directly added to the input representation:

$$X_{input} = X_{embeddings} + PE$$

#### Why Sinusoids?
The sinusoidal function was chosen because it allows the model to easily learn to attend by relative positions. For any fixed offset $k$, $PE(pos+k)$ can be represented as a linear function of $PE(pos)$. This mathematical property helps the model generalize to sequence lengths longer than those seen during training."""

        pe_starter = """import numpy as np

def positional_encoding(seq_len, d_model, base=10000.0):
    \"\"\"
    Return PE of shape (seq_len, d_model) using sin/cos formulation.
    Returns:
        List[List[float]] or np.ndarray of shape (seq_len, d_model)
    \"\"\"
    # Write your code here
    pass
"""
        # Test cases for Positional Encoding
        pe_tc1_in = {"seq_len": 3, "d_model": 4}
        pe_tc1_out = [
            [0.0, 1.0, 0.0, 1.0],
            [0.8414709848078965, 0.5403023058681398, 0.009999833334166664, 0.9999500004166653],
            [0.9092974268256817, -0.4161468365471424, 0.01999866669733332, 0.9998000066666667]
        ]
        
        pe_tc2_in = {"seq_len": 1, "d_model": 2}
        pe_tc2_out = [
            [0.0, 1.0]
        ]
        
        prob1 = models.Problem(
            title="Implement Positional Encoding (sin/cos)",
            description_md=pe_desc,
            theory_md=pe_theory,
            starter_code=pe_starter,
            difficulty="Medium",
            tags=["Linear Algebra", "Transformers"]
        )
        db.add(prob1)
        db.commit()
        db.refresh(prob1)
        
        db.add(models.TestCase(problem_id=prob1.id, input_json=pe_tc1_in, expected_output=json.dumps(pe_tc1_out), is_public=True))
        db.add(models.TestCase(problem_id=prob1.id, input_json=pe_tc2_in, expected_output=json.dumps(pe_tc2_out), is_public=False))
        db.commit()
        print("Seeded 'Implement Positional Encoding'.")

        # 2. Softmax Function
        softmax_desc = """Compute the Softmax activation function.

Given an input array `x` representing logit scores, apply the softmax transformation. Softmax converts raw logits into a probability distribution where all elements are positive and sum to 1.

Your solution must support both 1D arrays (single sample) and 2D arrays (batch of samples).

### Mathematical Definition
For a vector $\\mathbf{z}$:

$$\\text{softmax}(\\mathbf{z})_i = \\frac{e^{z_i}}{\\sum_{j} e^{z_j}}$$

### Numerical Stability
Standard softmax can overflow if $z_i$ is very large (e.g., $e^{1000} \\to \\infty$). To avoid this, subtract the maximum value along the axis before exponentiating:

$$\\text{softmax}(\\mathbf{z})_i = \\frac{e^{z_i - \\max(\\mathbf{z})}}{\\sum_{j} e^{z_j - \\max(\\mathbf{z})}}$$"""

        softmax_theory = """### Activation Functions: Softmax
Softmax is the standard output activation function for multi-class classification networks. 

#### Properties:
1. **Range**: Every output lies in the interval $(0, 1)$.
2. **Sum to 1**: All outputs sum to exactly 1.0, representing a valid probability distribution.
3. **Monotonicity**: Larger inputs yield larger outputs, preserving the ordering of raw outputs (logits).

#### Batch Processing
When training ML models, data is processed in batches (2D arrays of shape `[batch_size, num_classes]`). Softmax should be computed along the class axis (typically `axis=-1`), ensuring each batch element sums to 1 independently."""

        softmax_starter = """import numpy as np

def softmax(x):
    \"\"\"
    Compute softmax values for each set of scores in x.
    Support 1D list/numpy array and 2D batch list/numpy array.
    Returns:
        List[float] or List[List[float]]
    \"\"\"
    # Write your code here
    pass
"""
        softmax_tc1_in = {"x": [1.0, 2.0, 3.0]}
        softmax_tc1_out = [0.09003057317038046, 0.24472847105479764, 0.6652409557748218]
        
        softmax_tc2_in = {"x": [[1.0, 2.0], [3.0, 4.0]]}
        softmax_tc2_out = [[0.2689414213699951, 0.7310585786300049], [0.2689414213699951, 0.7310585786300049]]
        
        prob2 = models.Problem(
            title="Softmax Function",
            description_md=softmax_desc,
            theory_md=softmax_theory,
            starter_code=softmax_starter,
            difficulty="Easy",
            tags=["Neural Networks", "Activation Functions"]
        )
        db.add(prob2)
        db.commit()
        db.refresh(prob2)
        
        db.add(models.TestCase(problem_id=prob2.id, input_json=softmax_tc1_in, expected_output=json.dumps(softmax_tc1_out), is_public=True))
        db.add(models.TestCase(problem_id=prob2.id, input_json=softmax_tc2_in, expected_output=json.dumps(softmax_tc2_out), is_public=False))
        db.commit()
        print("Seeded 'Softmax Function'.")

        # 3. Mean Squared Error Loss
        mse_desc = """Compute the Mean Squared Error (MSE) loss between true values $y_{true}$ and predicted values $y_{pred}$.

Both inputs are 1D arrays of equal length.

### Mathematical Formulation
$$\\text{MSE} = \\frac{1}{N} \\sum_{i=1}^{N} (y_{true, i} - y_{pred, i})^2$$"""

        mse_theory = """### Loss Functions: Mean Squared Error
Mean Squared Error (MSE), also known as L2 Loss, is the standard loss function for regression tasks.

It measures the average squared difference between predictions and actual targets. By squaring the errors, MSE penalizes larger errors much more heavily than smaller errors, driving the model to avoid outliers."""

        mse_starter = """import numpy as np

def mse_loss(y_true, y_pred):
    \"\"\"
    Compute Mean Squared Error between true and predicted targets.
    Returns:
        float
    \"\"\"
    # Write your code here
    pass
"""
        mse_tc1_in = {"y_true": [1.0, 2.0, 3.0], "y_pred": [1.5, 2.5, 2.0]}
        mse_tc1_out = 0.5
        
        mse_tc2_in = {"y_true": [0.0, 0.0, 0.0], "y_pred": [0.1, -0.2, 0.3]}
        mse_tc2_out = 0.04666666666666667
        
        prob3 = models.Problem(
            title="Mean Squared Error Loss",
            description_md=mse_desc,
            theory_md=mse_theory,
            starter_code=mse_starter,
            difficulty="Easy",
            tags=["Supervised Learning", "Loss Functions"]
        )
        db.add(prob3)
        db.commit()
        db.refresh(prob3)
        
        db.add(models.TestCase(problem_id=prob3.id, input_json=mse_tc1_in, expected_output=json.dumps(mse_tc1_out), is_public=True))
        db.add(models.TestCase(problem_id=prob3.id, input_json=mse_tc2_in, expected_output=json.dumps(mse_tc2_out), is_public=False))
        db.commit()
        print("Seeded 'Mean Squared Error Loss'.")

        # 4. ReLU Activation
        relu_desc = """Apply the Rectified Linear Unit (ReLU) activation function element-wise to the input list $x$.

ReLU is one of the most widely used activation functions in deep neural networks due to its simplicity and effectiveness.

### Mathematical Formulation
$$f(x) = \\max(0, x)$$
"""

        relu_theory = """### Activation Functions: ReLU
The Rectified Linear Unit (ReLU) activation function is a piecewise linear function that outputs the input directly if it is positive, otherwise, it outputs zero:

$$f(x) = \\max(0, x)$$

#### Why use ReLU?
1. **Sparsity**: ReLU turns off neurons that output negative values, leading to sparse representations.
2. **Gradient Flow**: It does not saturate in the positive region (unlike Sigmoid or Tanh), preventing the vanishing gradient problem during backpropagation."""

        relu_starter = """def relu(x):
    \"\"\"
    Apply ReLU element-wise on a 1D vector x.
    x: List[float]
    Returns: List[float]
    \"\"\"
    # Write your code here
    pass
"""
        relu_tc1_in = {"x": [-2.0, -1.0, 0.0, 1.5, 3.0]}
        relu_tc1_out = [0.0, 0.0, 0.0, 1.5, 3.0]
        relu_tc2_in = {"x": [-100.5, 50.2]}
        relu_tc2_out = [0.0, 50.2]

        prob4 = models.Problem(
            title="ReLU Activation Function",
            description_md=relu_desc,
            theory_md=relu_theory,
            starter_code=relu_starter,
            difficulty="Easy",
            tags=["Neural Networks", "Activation Functions"]
        )
        db.add(prob4)
        db.commit()
        db.refresh(prob4)

        db.add(models.TestCase(problem_id=prob4.id, input_json=relu_tc1_in, expected_output=json.dumps(relu_tc1_out), is_public=True))
        db.add(models.TestCase(problem_id=prob4.id, input_json=relu_tc2_in, expected_output=json.dumps(relu_tc2_out), is_public=False))
        db.commit()
        print("Seeded 'ReLU Activation Function'.")

        # 5. Dot Product
        dot_desc = """Compute the mathematical dot product of two 1D vectors $a$ and $b$ of equal length.

The dot product is the sum of the products of the corresponding entries of the two sequences of numbers.

### Mathematical Formulation
$$a \\cdot b = \\sum_{i=1}^{N} a_i b_i$$"""

        dot_theory = """### Linear Algebra: Dot Product
The dot product (scalar product) is a fundamental algebraic operation. It takes two coordinate vectors of equal length and returns a single number.

#### Applications in ML:
- **Fully Connected Layers**: A dense layer computes $Y = W \\cdot X + b$, which is a series of dot products.
- **Cosine Similarity**: Measures the directional alignment of two word embeddings."""

        dot_starter = """def dot_product(a, b):
    \"\"\"
    Compute the dot product of two vectors of equal length.
    a: List[float]
    b: List[float]
    Returns: float
    \"\"\"
    # Write your code here
    pass
"""
        dot_tc1_in = {"a": [1.0, 2.0, 3.0], "b": [4.0, 5.0, 6.0]}
        dot_tc1_out = 32.0  # 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
        dot_tc2_in = {"a": [0.0, 1.0], "b": [9.5, 0.0]}
        dot_tc2_out = 0.0

        prob5 = models.Problem(
            title="Vector Dot Product",
            description_md=dot_desc,
            theory_md=dot_theory,
            starter_code=dot_starter,
            difficulty="Easy",
            tags=["Linear Algebra", "Basics"]
        )
        db.add(prob5)
        db.commit()
        db.refresh(prob5)

        db.add(models.TestCase(problem_id=prob5.id, input_json=dot_tc1_in, expected_output=json.dumps(dot_tc1_out), is_public=True))
        db.add(models.TestCase(problem_id=prob5.id, input_json=dot_tc2_in, expected_output=json.dumps(dot_tc2_out), is_public=False))
        db.commit()
        print("Seeded 'Vector Dot Product'.")

        # 6. Matrix Transpose
        transpose_desc = """Transpose a 2D matrix (represented as a List of Lists).

Transposing flips the matrix over its diagonal, switching its row and column indices.

### Mathematical Formulation
For a matrix $A$ of shape $M \\times N$, its transpose $A^T$ of shape $N \\times M$ is defined by:
$$(A^T)_{i, j} = A_{j, i}$$"""

        transpose_theory = """### Linear Algebra: Matrix Transpose
Transposing is a basic matrix manipulation. It swaps the rows and columns:
- A row vector becomes a column vector and vice-versa.
- In neural networks, weights matrices are transposed during backpropagation to match gradient dimensions."""

        transpose_starter = """def transpose(matrix):
    \"\"\"
    Transpose a 2D matrix.
    matrix: List[List[float]]
    Returns: List[List[float]]
    \"\"\"
    # Write your code here
    pass
"""
        transpose_tc1_in = {"matrix": [[1, 2], [3, 4]]}
        transpose_tc1_out = [[1, 3], [2, 4]]
        transpose_tc2_in = {"matrix": [[1, 2, 3], [4, 5, 6]]}
        transpose_tc2_out = [[1, 4], [2, 5], [3, 6]]

        prob6 = models.Problem(
            title="Matrix Transpose",
            description_md=transpose_desc,
            theory_md=transpose_theory,
            starter_code=transpose_starter,
            difficulty="Easy",
            tags=["Linear Algebra", "Basics"]
        )
        db.add(prob6)
        db.commit()
        db.refresh(prob6)

        db.add(models.TestCase(problem_id=prob6.id, input_json=transpose_tc1_in, expected_output=json.dumps(transpose_tc1_out), is_public=True))
        db.add(models.TestCase(problem_id=prob6.id, input_json=transpose_tc2_in, expected_output=json.dumps(transpose_tc2_out), is_public=False))
        db.commit()
        print("Seeded 'Matrix Transpose'.")

        # 7. RAG: Document Parsing (PDF and DOCX)
        parse_desc = """Implement the Ingestion and Parsing layer of a RAG pipeline.

Given a base64 encoded document string `file_content` and its `file_type` (`"pdf"` or `"docx"`), decode the document and extract its plain text.

### Parsing Rules
1. Decode the base64-encoded `file_content` into bytes.
2. If `file_type == "pdf"`, use `pypdf.PdfReader` to extract the plain text of all pages and return the joined text.
3. If `file_type == "docx"`, use `docx.Document` to extract text from all paragraphs and join them with a single newline `\\n`.
4. Return the parsed text."""

        parse_theory = """### Ingestion and Parsing in RAG
The first stage of any Retrieval-Augmented Generation pipeline is data ingestion. Documents are rarely stored in clean text formats; they are typically packaged in binary containers like PDFs or Word documents (.docx).

To index this knowledge, the GenAI application must decode these binaries and extract the underlying textual data:
- **PDFs**: Structure text as drawing operations on a canvas, meaning we must walk page by page to extract layout strings.
- **DOCX**: Compiles texts into XML formats under a ZIP archive, requiring paragraph paragraph mapping."""

        parse_starter = """import base64
import io
import pypdf
import docx

def parse_document(file_content, file_type):
    \"\"\"
    Decode base64 file content and parse based on file_type ('pdf' or 'docx').
    Returns: str (extracted plain text)
    \"\"\"
    # Write your code here
    pass
"""
        parse_tc1_in = {"file_content": PDF_BASE64, "file_type": "pdf"}
        parse_tc1_out = "RAG Technical Specification\nRetrieval-Augmented Generation (RAG) is a technique that bridges the gap between static LLM\nknowledge and dynamic private databases. First, the Ingestion layer reads PDF or Word files. Next, the\nParser converts these binary streams to plain text. Then, the Chunking step splits text using character\nboundaries and sliding overlaps. The Embedding model projects chunks into high-dimensional vectors.\nFAISS stores and indexes these vectors. Finally, the Retriever queries FAISS to retrieve context and\nstuff it into the LLM prompt.\n"
        
        parse_tc2_in = {"file_content": DOCX_BASE64, "file_type": "docx"}
        parse_tc2_out = "RAG Technical Specification\nRetrieval-Augmented Generation (RAG) is a technique that bridges the gap between static LLM knowledge and dynamic private databases. First, the Ingestion layer reads PDF or Word files. Next, the Parser converts these binary streams to plain text. Then, the Chunking step splits text using character boundaries and sliding overlaps. The Embedding model projects chunks into high-dimensional vectors. FAISS stores and indexes these vectors. Finally, the Retriever queries FAISS to retrieve context and stuff it into the LLM prompt."

        prob7 = models.Problem(
            title="RAG: Document Parsing (PDF and DOCX)",
            description_md=parse_desc,
            theory_md=parse_theory,
            starter_code=parse_starter,
            difficulty="Medium",
            tags=["RAG", "Data Ingestion", "NLP"]
        )
        db.add(prob7)
        db.commit()
        db.refresh(prob7)
        
        db.add(models.TestCase(problem_id=prob7.id, input_json=parse_tc1_in, expected_output=json.dumps(parse_tc1_out), is_public=True))
        db.add(models.TestCase(problem_id=prob7.id, input_json=parse_tc2_in, expected_output=json.dumps(parse_tc2_out), is_public=False))
        db.commit()
        print("Seeded 'RAG: Document Parsing'.")

        # 8. RAG: Fixed-Length Chunking
        chunk_desc = """Implement the Chunking layer of a RAG pipeline.

Given a plain `text` string, a `chunk_size` (maximum character length of a chunk), and an `overlap` (number of characters of overlap between consecutive chunks), split the text into chunks.

### Chunking Logic
1. The first chunk starts at index `0` and has length `chunk_size`.
2. The next chunk starts at index `start_index = previous_start_index + (chunk_size - overlap)`.
3. If this new `start_index` is greater than or equal to the length of the text, stop.
4. Otherwise, extract a chunk of length `chunk_size` starting at `start_index`. If `start_index + chunk_size` exceeds the text length, slice to the end of the text.
5. Repeat this process until all characters are processed."""

        chunk_theory = """### Document Chunking in RAG
Once a document is converted to plain text, it must be segmented into smaller fragments called chunks.

#### Fixed-Length Sliding Windows
A basic strategy uses character boundaries. An overlap window repeats trailing text across splits, keeping sentences or semantic thoughts intact even if they occur at a hard split boundary."""

        chunk_starter = """def chunk_text(text, chunk_size, overlap):
    \"\"\"
    Splits text into chunks of size chunk_size with the given overlap.
    text: str
    chunk_size: int
    overlap: int
    Returns: List[str]
    \"\"\"
    # Write your code here
    pass
"""
        chunk_tc1_in = {"text": "abcdefghij", "chunk_size": 4, "overlap": 2}
        chunk_tc1_out = ["abcd", "cdef", "efgh", "ghij", "ij"]
        
        chunk_tc2_in = {"text": "Hello World", "chunk_size": 5, "overlap": 0}
        chunk_tc2_out = ["Hello", " Worl", "d"]

        prob8 = models.Problem(
            title="RAG: Fixed-Length Chunking",
            description_md=chunk_desc,
            theory_md=chunk_theory,
            starter_code=chunk_starter,
            difficulty="Easy",
            tags=["RAG", "Data Processing", "NLP"]
        )
        db.add(prob8)
        db.commit()
        db.refresh(prob8)
        
        db.add(models.TestCase(problem_id=prob8.id, input_json=chunk_tc1_in, expected_output=json.dumps(chunk_tc1_out), is_public=True))
        db.add(models.TestCase(problem_id=prob8.id, input_json=chunk_tc2_in, expected_output=json.dumps(chunk_tc2_out), is_public=False))
        db.commit()
        print("Seeded 'RAG: Fixed-Length Chunking'.")

        # 9. RAG: Semantic Embeddings (SentenceTransformer)
        embed_desc = """Implement the Embedding layer of a RAG pipeline using the **SentenceTransformers** library.

Given a list of text `chunks` and a `query` string, use `SentenceTransformer('all-MiniLM-L6-v2')` to generate dense vector embeddings.

Return a dictionary containing the query embedding (1D list of floats) and the chunk embeddings (2D list of floats):
```python
{
    "query_embedding": query_emb, # List[float]
    "chunk_embeddings": chunk_embs # List[List[float]]
}
```"""

        embed_theory = """### Semantic Embeddings with SentenceTransformers
Computers cannot natively read plain text. To match semantic queries with documents, text must be translated into high-dimensional vectors representing meaning.

**SentenceTransformers** is a Python framework that uses pre-trained Transformer models (like BERT or MiniLM) to map text to a dense vector space, allowing similar text segments to lie close together in Euclidean or Cosine distance."""

        embed_starter = """from sentence_transformers import SentenceTransformer

def generate_embeddings(chunks, query):
    \"\"\"
    Generate semantic embeddings using SentenceTransformer('all-MiniLM-L6-v2').
    chunks: List[str]
    query: str
    Returns: dict with keys 'query_embedding' and 'chunk_embeddings'
    \"\"\"
    # Write your code here
    pass
"""
        embed_tc1_in = {"chunks": ["hello", "world"], "query": "hi"}
        # Compute expected embeddings dynamically using the SentenceTransformer model
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer('all-MiniLM-L6-v2')
        _chunk_embs = _model.encode(embed_tc1_in["chunks"], convert_to_numpy=True).tolist()
        _query_emb = _model.encode(embed_tc1_in["query"], convert_to_numpy=True).tolist()
        embed_tc1_out = {
            "query_embedding": _query_emb,
            "chunk_embeddings": _chunk_embs
        }

        prob9 = models.Problem(
            title="RAG: Semantic Embeddings (SentenceTransformer)",
            description_md=embed_desc,
            theory_md=embed_theory,
            starter_code=embed_starter,
            difficulty="Medium",
            tags=["RAG", "Vector Embeddings", "NLP"]
        )
        db.add(prob9)
        db.commit()
        db.refresh(prob9)
        
        db.add(models.TestCase(problem_id=prob9.id, input_json=embed_tc1_in, expected_output=json.dumps(embed_tc1_out), is_public=True))
        db.commit()
        print("Seeded 'RAG: Semantic Embeddings (SentenceTransformer)'.")

        # 10. RAG: FAISS Vector Database Storage
        faiss_store_desc = """Implement the Vector Database Storage layer of a RAG pipeline using **FAISS**.

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
```"""

        faiss_store_theory = """### Flat L2 Indexing in FAISS
FAISS provides multiple index types. The simplest is **IndexFlatL2**, which performs exact nearest-neighbor search by computing L2 (Euclidean) distances between vectors.

A flat index is highly accurate because it performs exact nearest neighbor queries. For very large datasets, FAISS supports approximate nearest neighbor (ANN) indices (like IVF, HNSW) to trade a small amount of accuracy for orders-of-magnitude speedups."""

        faiss_store_starter = """import numpy as np
import faiss

def build_faiss_index(embeddings):
    \"\"\"
    Build a FAISS IndexFlatL2 index and add embeddings.
    embeddings: List[List[float]]
    Returns: dict with keys 'ntotal' and 'dimension'
    \"\"\"
    # Write your code here
    pass
"""
        faiss_store_tc1_in = {"embeddings": [[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]}
        faiss_store_tc1_out = {"ntotal": 3, "dimension": 2}

        prob10 = models.Problem(
            title="RAG: FAISS Vector Database Storage",
            description_md=faiss_store_desc,
            theory_md=faiss_store_theory,
            starter_code=faiss_store_starter,
            difficulty="Medium",
            tags=["RAG", "Vector Search", "FAISS"]
        )
        db.add(prob10)
        db.commit()
        db.refresh(prob10)
        
        db.add(models.TestCase(problem_id=prob10.id, input_json=faiss_store_tc1_in, expected_output=json.dumps(faiss_store_tc1_out), is_public=True))
        db.commit()
        print("Seeded 'RAG: FAISS Vector Database Storage'.")

        # 11. RAG: FAISS Vector Database Retrieval
        faiss_ret_desc = """Implement the Retrieval layer of a RAG pipeline using **FAISS**.

Given a query embedding `query_emb` (1D list of floats), a list of document embeddings `doc_embs` (2D list of floats), and an integer `k`, build a FAISS flat L2 index, add the document vectors, and query the index to retrieve the indices of the `k` closest documents.

### Steps
1. Convert `doc_embs` to a 2D numpy array of type `np.float32`.
2. Convert `query_emb` to a 2D numpy array of type `np.float32` and shape `(1, D)`.
3. Create a flat L2 index: `index = faiss.IndexFlatL2(D)`.
4. Add the document embeddings array to the index.
5. Search the index with the query embedding array for the `k` nearest neighbors using `distances, indices = index.search(query_emb_np, k)`.
6. Return the indices of the closest documents as a list of integers (extract from the 2D indices array)."""

        faiss_ret_theory = """### Querying a FAISS L2 Index
Once embeddings are stored in a FAISS index, we query it using the query vector. The L2 index calculates the Euclidean distance:
$$d(q, x) = \\sum_{i=1}^D (q_i - x_i)^2$$
And returns the indices of the closest document vectors, sorted from smallest distance to largest."""

        faiss_ret_starter = """import numpy as np
import faiss

def retrieve_faiss(query_emb, doc_embs, k):
    \"\"\"
    Build index and search closest documents using FAISS.
    query_emb: List[float]
    doc_embs: List[List[float]]
    k: int
    Returns: List[int]
    \"\"\"
    # Write your code here
    pass
"""
        faiss_ret_tc1_in = {
            "query_emb": [1.0, 0.0],
            "doc_embs": [[0.8, 0.6], [0.1, 0.9], [1.0, 0.0], [0.0, 1.0]],
            "k": 2
        }
        faiss_ret_tc1_out = [2, 0]
        
        faiss_ret_tc2_in = {
            "query_emb": [0.5, 0.5],
            "doc_embs": [[0.5, 0.5], [-0.5, -0.5], [0.0, 1.0]],
            "k": 5
        }
        faiss_ret_tc2_out = [0, 2, 1]

        prob11 = models.Problem(
            title="RAG: FAISS Vector Database Retrieval",
            description_md=faiss_ret_desc,
            theory_md=faiss_ret_theory,
            starter_code=faiss_ret_starter,
            difficulty="Medium",
            tags=["RAG", "Vector Search", "FAISS"]
        )
        db.add(prob11)
        db.commit()
        db.refresh(prob11)
        
        db.add(models.TestCase(problem_id=prob11.id, input_json=faiss_ret_tc1_in, expected_output=json.dumps(faiss_ret_tc1_out), is_public=True))
        db.add(models.TestCase(problem_id=prob11.id, input_json=faiss_ret_tc2_in, expected_output=json.dumps(faiss_ret_tc2_out), is_public=False))
        db.commit()
        print("Seeded 'RAG: FAISS Vector Database Retrieval'.")

        # 12. RAG: End-to-End System Pipeline
        e2e_desc = """Implement the complete Ingestion-to-Generation RAG pipeline matching the full architecture:
`Ingestion (PDF/Word) -> Parsing -> Chunking -> Embedding -> FAISS Vector DB -> Retrieval -> Prompt Assembly -> LLM Output`

### Task
Implement `run_rag_pipeline`. The input file will be passed as a base64 encoded string.

### Steps
1. **Decode Ingestion**: Decode the base64-encoded `file_content` into raw bytes.
2. **Parse Document**:
   - If `file_type == "pdf"`, use `pypdf.PdfReader` to extract the plain text of all pages.
   - If `file_type == "docx"`, use `docx.Document` to extract text from all paragraphs and join them with a single newline `\\n`.
3. **Chunk Text**: Split the parsed plain text into chunks using fixed-size sliding-window chunking (with `overlap` and `chunk_size` characters).
4. **Generate Embeddings**: Use `SentenceTransformer('all-MiniLM-L6-v2')` to generate embedding vectors for all text chunks and the `query`.
5. **FAISS Vector DB**: Build a flat L2 index (`faiss.IndexFlatL2`), load the chunk embeddings (as `np.float32`), and query it with the query embedding to retrieve the top `k` closest chunk indices.
6. **Compile Prompt**: Pack the retrieved chunks into `system_template` within the `max_chars` budget. Chunks are added one by one in the order returned by FAISS. If adding a chunk causes the formatted prompt length to exceed `max_chars`, stop adding chunks. If no chunks can be added, context is `""`.
7. **Query LLM**: Query the mock LLM by looking up the final prompt in `llm_response_map`. If the prompt is not present in the map, default to `f"LLM Response grounded on: {selected_chunks[0][:30]}..."` (if chunks are selected) or `"No context loaded"` (if no chunks are selected).
8. **Return**: A dictionary containing the stage variables."""

        e2e_theory = """### The Unified RAG Pipeline
In production, a GenAI application coordinates multiple discrete subsystems:
1. **Ingestion & Parsing**: Transforming binary files (PDFs, DOCX) into clean text strings.
2. **Indexing**: Segmenting the text into chunks and converting them into dense semantic vectors using models like SentenceTransformers.
3. **Retrieval**: Performing nearest-neighbor searches in a vector store like FAISS to isolate the most relevant context.
4. **Generation**: Merging the retrieved context with the user query, and sending the compiled prompt to a Large Language Model (LLM) to generate a grounded, accurate response."""

        e2e_starter = """import base64
import io
import numpy as np
import pypdf
import docx
import faiss
from sentence_transformers import SentenceTransformer

def run_rag_pipeline(file_content, file_type, query, chunk_size, overlap, k, system_template, max_chars, llm_response_map):
    \"\"\"
    Ingest, parse, chunk, embed, index, retrieve, compile and query LLM.
    Returns:
        dict with keys: 'text', 'chunks', 'retrieved_indices', 'prompt', 'response'
    \"\"\"
    # Write your code here
    pass
"""
        e2e_tc1_in = {
            "file_content": PDF_BASE64,
            "file_type": "pdf",
            "query": "ingestion layer",
            "chunk_size": 120,
            "overlap": 30,
            "k": 2,
            "system_template": "Context:\n{context}\n\nQuery: {query}",
            "max_chars": 350,
            "llm_response_map": {
                "Context:\nes the gap between static LLM\nknowledge and dynamic private databases. First, the Ingestion layer reads PDF or Word file\n\nn layer reads PDF or Word files. Next, the\nParser converts these binary streams to plain text. Then, the Chunking step s\n\nQuery: ingestion layer": "LLM: Ingestion reads PDF/Word files, Parser extracts plain text."
            }
        }
        e2e_tc1_out = {
            "text": "RAG Technical Specification\nRetrieval-Augmented Generation (RAG) is a technique that bridges the gap between static LLM\nknowledge and dynamic private databases. First, the Ingestion layer reads PDF or Word files. Next, the\nParser converts these binary streams to plain text. Then, the Chunking step splits text using character\nboundaries and sliding overlaps. The Embedding model projects chunks into high-dimensional vectors.\nFAISS stores and indexes these vectors. Finally, the Retriever queries FAISS to retrieve context and\nstuff it into the LLM prompt.\n",
            "chunks": [
                "RAG Technical Specification\nRetrieval-Augmented Generation (RAG) is a technique that bridges the gap between static LLM\n",
                "es the gap between static LLM\nknowledge and dynamic private databases. First, the Ingestion layer reads PDF or Word file",
                "n layer reads PDF or Word files. Next, the\nParser converts these binary streams to plain text. Then, the Chunking step s",
                "ext. Then, the Chunking step splits text using character\nboundaries and sliding overlaps. The Embedding model projects c",
                "The Embedding model projects chunks into high-dimensional vectors.\nFAISS stores and indexes these vectors. Finally, the ",
                "s these vectors. Finally, the Retriever queries FAISS to retrieve context and\nstuff it into the LLM prompt.\n",
                "o the LLM prompt.\n"
            ],
            "retrieved_indices": [1, 2],
            "prompt": "Context:\nes the gap between static LLM\nknowledge and dynamic private databases. First, the Ingestion layer reads PDF or Word file\n\nn layer reads PDF or Word files. Next, the\nParser converts these binary streams to plain text. Then, the Chunking step s\n\nQuery: ingestion layer",
            "response": "LLM: Ingestion reads PDF/Word files, Parser extracts plain text."
        }

        e2e_tc2_in = {
            "file_content": DOCX_BASE64,
            "file_type": "docx",
            "query": "FAISS vector store",
            "chunk_size": 120,
            "overlap": 30,
            "k": 2,
            "system_template": "Context:\n{context}\n\nQuery: {query}",
            "max_chars": 350,
            "llm_response_map": {
                "Context:\nThe Embedding model projects chunks into high-dimensional vectors. FAISS stores and indexes these vectors. Finally, the \n\ns these vectors. Finally, the Retriever queries FAISS to retrieve context and stuff it into the LLM prompt.\n\nQuery: FAISS vector store": "LLM: FAISS indexes the dense vectors for nearest-neighbor L2 search."
            }
        }
        e2e_tc2_out = {
            "text": "RAG Technical Specification\nRetrieval-Augmented Generation (RAG) is a technique that bridges the gap between static LLM knowledge and dynamic private databases. First, the Ingestion layer reads PDF or Word files. Next, the Parser converts these binary streams to plain text. Then, the Chunking step splits text using character boundaries and sliding overlaps. The Embedding model projects chunks into high-dimensional vectors. FAISS stores and indexes these vectors. Finally, the Retriever queries FAISS to retrieve context and stuff it into the LLM prompt.",
            "chunks": [
                "RAG Technical Specification\nRetrieval-Augmented Generation (RAG) is a technique that bridges the gap between static LLM ",
                "es the gap between static LLM knowledge and dynamic private databases. First, the Ingestion layer reads PDF or Word file",
                "n layer reads PDF or Word files. Next, the Parser converts these binary streams to plain text. Then, the Chunking step s",
                "ext. Then, the Chunking step splits text using character boundaries and sliding overlaps. The Embedding model projects c",
                "The Embedding model projects chunks into high-dimensional vectors. FAISS stores and indexes these vectors. Finally, the ",
                "s these vectors. Finally, the Retriever queries FAISS to retrieve context and stuff it into the LLM prompt.",
                "o the LLM prompt."
            ],
            "retrieved_indices": [4, 5],
            "prompt": "Context:\nThe Embedding model projects chunks into high-dimensional vectors. FAISS stores and indexes these vectors. Finally, the \n\ns these vectors. Finally, the Retriever queries FAISS to retrieve context and stuff it into the LLM prompt.\n\nQuery: FAISS vector store",
            "response": "LLM: FAISS indexes the dense vectors for nearest-neighbor L2 search."
        }

        prob12 = models.Problem(
            title="RAG: End-to-End System Pipeline",
            description_md=e2e_desc,
            theory_md=e2e_theory,
            starter_code=e2e_starter,
            difficulty="Hard",
            tags=["RAG", "System Design", "NLP"]
        )
        db.add(prob12)
        db.commit()
        db.refresh(prob12)
        
        db.add(models.TestCase(problem_id=prob12.id, input_json=e2e_tc1_in, expected_output=json.dumps(e2e_tc1_out), is_public=True))
        db.add(models.TestCase(problem_id=prob12.id, input_json=e2e_tc2_in, expected_output=json.dumps(e2e_tc2_out), is_public=False))
        db.commit()
        print("Seeded 'RAG: End-to-End System Pipeline'.")

        print("Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
