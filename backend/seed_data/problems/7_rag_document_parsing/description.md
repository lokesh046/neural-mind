Implement the Ingestion and Parsing layer of a RAG pipeline.

Given a base64 encoded document string `file_content` and its `file_type` (`"pdf"` or `"docx"`), decode the document and extract its plain text.

### Parsing Rules
1. Decode the base64-encoded `file_content` into bytes.
2. If `file_type == "pdf"`, use `pypdf.PdfReader` to extract the plain text of all pages and return the joined text.
3. If `file_type == "docx"`, use `docx.Document` to extract text from all paragraphs and join them with a single newline `\n`.
4. Return the parsed text.