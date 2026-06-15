Implement sinusoidal positional encodings as described in **"Attention Is All You Need"** to inject sequence order into token embeddings.

Given a sequence length `seq_len` and model dimension `d_model`, compute the positional encoding matrix using the sine and cosine formulation.

### Mathematical Formulation
For a position $pos$ and dimension index $i$:

$$PE(pos, 2i) = \sin\left(rac{pos}{base^{rac{2i}{d_{model}}}}ight)$$
$$PE(pos, 2i+1) = \cos\left(rac{pos}{base^{rac{2i}{d_{model}}}}ight)$$

Where $base = 10000.0$ by default.

Even-indexed columns use sine, odd-indexed columns use cosine, and the frequency decreases with the dimension index.