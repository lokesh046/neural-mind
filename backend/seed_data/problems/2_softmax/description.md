Compute the Softmax activation function.

Given an input array `x` representing logit scores, apply the softmax transformation. Softmax converts raw logits into a probability distribution where all elements are positive and sum to 1.

Your solution must support both 1D arrays (single sample) and 2D arrays (batch of samples).

### Mathematical Definition
For a vector $\mathbf{z}$:

$$	ext{softmax}(\mathbf{z})_i = rac{e^{z_i}}{\sum_{j} e^{z_j}}$$

### Numerical Stability
Standard softmax can overflow if $z_i$ is very large (e.g., $e^{1000} 	o \infty$). To avoid this, subtract the maximum value along the axis before exponentiating:

$$	ext{softmax}(\mathbf{z})_i = rac{e^{z_i - \max(\mathbf{z})}}{\sum_{j} e^{z_j - \max(\mathbf{z})}}$$