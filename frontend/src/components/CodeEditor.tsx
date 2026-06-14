import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  defaultValue: string;
  onChange: (value: string) => void;
  language?: string;
}

export default function CodeEditor({ defaultValue, onChange, language = 'python' }: CodeEditorProps) {
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    try {
      // Customise editor theme options if needed
      monaco.editor.defineTheme('neuralmind-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
          { token: 'keyword', foreground: '34d399', fontStyle: 'bold' }, // Emerald keywords
          { token: 'string', foreground: 'f472b6' }, // Pink strings
          { token: 'number', foreground: '60a5fa' }, // Blue numbers
        ],
        colors: {
          'editor.background': '#0b0f19', // Dark gray blue
          'editor.lineHighlightBackground': '#1e293b50',
          'editorGutter.background': '#0b0f19',
        },
      });
      monaco.editor.setTheme('neuralmind-dark');
    } catch (err) {
      console.error("Failed to define custom Monaco theme, falling back to default dark:", err);
    }
  };

  const editorOptions = {
    fontSize: 14,
    lineNumbersMinChars: 3,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    padding: { top: 12, bottom: 12 },
    fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
    fontLigatures: true,
    cursorBlinking: 'smooth' as const,
    cursorSmoothCaretAnimation: 'on' as const,
    smoothScrolling: true,
    tabSize: 4,
  };

  return (
    <div className="flex-1 min-h-0 w-full border border-gray-800 rounded-lg overflow-hidden bg-[#0b0f19] flex flex-col">
      <Editor
        height="100%"
        language={language}
        defaultValue={defaultValue}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={editorOptions}
        theme="neuralmind-dark"
        loading={
          <div className="flex flex-col items-center justify-center h-full bg-[#0b0f19] text-emerald-400 text-xs gap-2">
            <svg className="h-5 w-5 animate-spin text-emerald-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Loading Code Editor...</span>
          </div>
        }
      />
    </div>
  );
}
