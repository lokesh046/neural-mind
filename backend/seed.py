import json
import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, SessionLocal, engine
from app import models

# Ensure backend folder is on search path for relative imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))


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



        print("Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
