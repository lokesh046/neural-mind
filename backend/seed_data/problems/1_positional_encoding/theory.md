### Positional Encoding in Transformers
Unlike Recurrent Neural Networks (RNNs) or Convolutional Neural Networks (CNNs), which naturally process tokens sequentially, Self-Attention networks are permutation-invariant. This means they process all tokens in parallel and do not inherently know their order.

To solve this, the authors of the Transformer paper introduced **Positional Encodings** ($PE$). These encodings have the same dimension as the token embeddings, so they can be directly added to the input representation:

$$X_{input} = X_{embeddings} + PE$$

#### Why Sinusoids?
The sinusoidal function was chosen because it allows the model to easily learn to attend by relative positions. For any fixed offset $k$, $PE(pos+k)$ can be represented as a linear function of $PE(pos)$. This mathematical property helps the model generalize to sequence lengths longer than those seen during training.