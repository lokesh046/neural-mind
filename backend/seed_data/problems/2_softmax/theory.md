### Activation Functions: Softmax
Softmax is the standard output activation function for multi-class classification networks. 

#### Properties:
1. **Range**: Every output lies in the interval $(0, 1)$.
2. **Sum to 1**: All outputs sum to exactly 1.0, representing a valid probability distribution.
3. **Monotonicity**: Larger inputs yield larger outputs, preserving the ordering of raw outputs (logits).

#### Batch Processing
When training ML models, data is processed in batches (2D arrays of shape `[batch_size, num_classes]`). Softmax should be computed along the class axis (typically `axis=-1`), ensuring each batch element sums to 1 independently.