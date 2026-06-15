### Ingestion and Parsing in RAG
The first stage of any Retrieval-Augmented Generation pipeline is data ingestion. Documents are rarely stored in clean text formats; they are typically packaged in binary containers like PDFs or Word documents (.docx).

To index this knowledge, the GenAI application must decode these binaries and extract the underlying textual data:
- **PDFs**: Structure text as drawing operations on a canvas, meaning we must walk page by page to extract layout strings.
- **DOCX**: Compiles texts into XML formats under a ZIP archive, requiring paragraph paragraph mapping.