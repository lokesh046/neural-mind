### Document Chunking in RAG
Once a document is converted to plain text, it must be segmented into smaller fragments called chunks.

#### Fixed-Length Sliding Windows
A basic strategy uses character boundaries. An overlap window repeats trailing text across splits, keeping sentences or semantic thoughts intact even if they occur at a hard split boundary.