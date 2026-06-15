Implement the Chunking layer of a RAG pipeline.

Given a plain `text` string, a `chunk_size` (maximum character length of a chunk), and an `overlap` (number of characters of overlap between consecutive chunks), split the text into chunks.

### Chunking Logic
1. The first chunk starts at index `0` and has length `chunk_size`.
2. The next chunk starts at index `start_index = previous_start_index + (chunk_size - overlap)`.
3. If this new `start_index` is greater than or equal to the length of the text, stop.
4. Otherwise, extract a chunk of length `chunk_size` starting at `start_index`. If `start_index + chunk_size` exceeds the text length, slice to the end of the text.
5. Repeat this process until all characters are processed.