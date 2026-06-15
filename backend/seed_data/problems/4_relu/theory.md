### Activation Functions: ReLU
The Rectified Linear Unit (ReLU) activation function is a piecewise linear function that outputs the input directly if it is positive, otherwise, it outputs zero:

$$f(x) = \max(0, x)$$

#### Why use ReLU?
1. **Sparsity**: ReLU turns off neurons that output negative values, leading to sparse representations.
2. **Gradient Flow**: It does not saturate in the positive region (unlike Sigmoid or Tanh), preventing the vanishing gradient problem during backpropagation.