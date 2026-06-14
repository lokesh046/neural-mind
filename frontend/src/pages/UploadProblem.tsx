import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import SplitPane from '../components/SplitPane';
import katex from 'katex';
import { 
  ArrowLeft, 
  Send, 
  Plus, 
  Trash2, 
  FileText, 
  BookOpen, 
  Code, 
  Sparkles, 
  Database,
  Info,
  CheckCircle2,
  AlertCircle,
  FileCode
} from 'lucide-react';

interface MathComponentProps {
  math: string;
  block?: boolean;
}

const MathComponent: React.FC<MathComponentProps> = ({ math, block = false }) => {
  const containerRef = React.useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(math, containerRef.current, {
          displayMode: block,
          throwOnError: false,
        });
      } catch (err) {
        console.error(err);
      }
    }
  }, [math, block]);

  return block ? (
    <div className="w-full overflow-x-auto my-3 py-3.5 text-center bg-slate-900/30 border border-slate-800/40 rounded-xl">
      <span ref={containerRef} />
    </div>
  ) : (
    <span ref={containerRef} />
  );
};

interface TestCase {
  input_json: Record<string, any>;
  expected_output: string;
  is_public: boolean;
}

const DEFAULT_TEMPLATE = `# Simple Vector Addition
Difficulty: Easy
Tags: Linear Algebra, Basics

## Description
Compute the element-wise sum of two 1D lists \`a\` and \`b\` of equal length.

Your function should return a new list containing the element-wise sum:
\`\`\`
c[i] = a[i] + b[i]
\`\`\`

## Theory
Vector addition is a standard operation in linear algebra.
For any two vectors $a$ and $b$, the summation is defined element-wise:
$$c_i = a_i + b_i$$

Both input vectors must have the exact same dimensions for this operation to be mathematically defined.

## Starter Code
\`\`\`python
def vector_add(a, b):
    \"\"\"
    Compute element-wise addition of a and b.
    a: List[float]
    b: List[float]
    Returns: List[float]
    \"\"\"
    # Write your code here
    return [x + y for x, y in zip(a, b)]
\`\`\`

## Test Cases
Input: {"a": [1.0, 2.0, 3.0], "b": [4.0, 5.0, 6.0]}
Output: [5.0, 7.0, 9.0]
is_public: true

Input: {"a": [0.0], "b": [0.0]}
Output: [0.0]
is_public: false
`;

export default function UploadProblem() {
  const navigate = useNavigate();
  const [bulkContent, setBulkContent] = useState(DEFAULT_TEMPLATE);
  
  // Parsed and manually overrideable state
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [tags, setTags] = useState<string[]>([]);
  const [descriptionMd, setDescriptionMd] = useState('');
  const [theoryMd, setTheoryMd] = useState('');
  const [starterCode, setStarterCode] = useState('');
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  // UI States
  const [activePreviewTab, setActivePreviewTab] = useState<'description' | 'theory' | 'code' | 'testcases'>('description');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Parsing Effect
  useEffect(() => {
    try {
      const parsed = parseBulkContent(bulkContent);
      setTitle(parsed.title);
      setDifficulty(parsed.difficulty);
      setTags(parsed.tags);
      setDescriptionMd(parsed.description_md);
      setTheoryMd(parsed.theory_md);
      setStarterCode(parsed.starter_code);
      setTestCases(parsed.test_cases);
    } catch (e) {
      console.error("Parsing failed: ", e);
    }
  }, [bulkContent]);

  // Parser helper logic
  const parseBulkContent = (text: string) => {
    let parsedTitle = "";
    let parsedDifficulty = "Medium";
    let parsedTags: string[] = [];
    let parsedDescription = "";
    let parsedTheory = "";
    let parsedStarterCode = "";
    const parsedTestCases: TestCase[] = [];

    const lines = text.split('\n');
    
    // Metadata regex extraction
    const diffMatch = text.match(/difficulty:\s*(easy|medium|hard)/i);
    if (diffMatch) {
      parsedDifficulty = diffMatch[1].charAt(0).toUpperCase() + diffMatch[1].slice(1).toLowerCase();
    }

    const tagsMatch = text.match(/tags:\s*(.+)/i);
    if (tagsMatch) {
      parsedTags = tagsMatch[1].split(',').map(t => t.trim()).filter(Boolean);
    }

    const titleMatch = text.match(/title:\s*(.+)/i);
    if (titleMatch) {
      parsedTitle = titleMatch[1].trim();
    }

    // Split headings
    const sections: { heading: string; body: string }[] = [];
    let currentHeading = "";
    let currentBody: string[] = [];

    for (const line of lines) {
      const hMatch = line.match(/^#+\s+(.+)$/);
      if (hMatch) {
        if (currentHeading || currentBody.length > 0) {
          sections.push({ heading: currentHeading, body: currentBody.join('\n').trim() });
        }
        currentHeading = hMatch[1].trim();
        currentBody = [];
      } else {
        currentBody.push(line);
      }
    }
    if (currentHeading || currentBody.length > 0) {
      sections.push({ heading: currentHeading, body: currentBody.join('\n').trim() });
    }

    for (const sec of sections) {
      const headingLower = sec.heading.toLowerCase();
      
      if (!parsedTitle && sec.heading && !headingLower.includes("desc") && !headingLower.includes("theory") && !headingLower.includes("code") && !headingLower.includes("test")) {
        parsedTitle = sec.heading;
      }

      if (headingLower.includes("desc") || headingLower.includes("question") || headingLower.includes("problem")) {
        parsedDescription = sec.body;
      } else if (headingLower.includes("theory") || headingLower.includes("concept") || headingLower.includes("math")) {
        parsedTheory = sec.body;
      } else if (headingLower.includes("code") || headingLower.includes("starter") || headingLower.includes("solution")) {
        const codeBlockMatch = sec.body.match(/```(?:python)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
          parsedStarterCode = codeBlockMatch[1].trim();
        } else {
          parsedStarterCode = sec.body;
        }
      } else if (headingLower.includes("test")) {
        const tcLines = sec.body.split('\n');
        let currentInput: Record<string, any> | null = null;
        let isPublic = true;
        
        for (const tcLine of tcLines) {
          const lineTrim = tcLine.trim();
          const inputMatch = lineTrim.match(/^(?:input|in):\s*(.+)$/i);
          const outputMatch = lineTrim.match(/^(?:expected\s+)?(?:output|out):\s*(.+)$/i);
          const publicMatch = lineTrim.match(/^(?:is_)?public:\s*(true|false)$/i);
          
          if (publicMatch) {
            isPublic = publicMatch[1].toLowerCase() === 'true';
          }
          
          if (inputMatch) {
            try {
              currentInput = JSON.parse(inputMatch[1].trim());
            } catch {
              const valStr = inputMatch[1].trim();
              const eqMatch = valStr.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
              if (eqMatch) {
                try {
                  currentInput = { [eqMatch[1]]: JSON.parse(eqMatch[2].trim()) };
                } catch {
                  currentInput = { [eqMatch[1]]: eqMatch[2].trim() };
                }
              } else {
                currentInput = { input: valStr };
              }
            }
          } else if (outputMatch && currentInput) {
            parsedTestCases.push({
              input_json: currentInput,
              expected_output: outputMatch[1].trim(),
              is_public: isPublic
            });
            currentInput = null;
            isPublic = true;
          }
        }
      }
    }

    if (!parsedDescription && sections.length > 0 && sections[0].heading && parsedTitle === sections[0].heading) {
      parsedDescription = sections[0].body;
    }

    return {
      title: parsedTitle,
      difficulty: parsedDifficulty,
      tags: parsedTags,
      description_md: parsedDescription,
      theory_md: parsedTheory,
      starter_code: parsedStarterCode,
      test_cases: parsedTestCases
    };
  };

  // Math & MD renderer
  const parseMarkdown = (text: string) => {
    if (!text) return null;
    const blockParts = text.split(/\$\$(.*?)\$\$/gs);
    
    return blockParts.map((blockPart, bIdx) => {
      if (bIdx % 2 === 1) {
        return (
          <div key={`block-math-${bIdx}`} className="my-3">
            <MathComponent math={blockPart.trim()} block />
          </div>
        );
      }
      
      const inlineParts = blockPart.split(/\$(.*?)\$/g);
      const renderedInline = inlineParts.map((inlinePart, iIdx) => {
        if (iIdx % 2 === 1) {
          return <MathComponent key={`inline-math-${iIdx}`} math={inlinePart} />;
        }
        
        const lines = inlinePart.split('\n');
        return lines.map((line, lIdx) => {
          if (line.startsWith('### ')) {
            return <h3 key={`h3-${lIdx}`} className="text-sm font-bold text-white mt-4 mb-2">{line.replace('### ', '')}</h3>;
          }
          if (line.startsWith('## ')) {
            return <h2 key={`h2-${lIdx}`} className="text-base font-bold text-white mt-5 mb-2.5 border-b border-slate-900 pb-1">{line.replace('## ', '')}</h2>;
          }
          if (line.startsWith('# ')) {
            return <h1 key={`h1-${lIdx}`} className="text-xl font-extrabold text-white mt-6 mb-3">{line.replace('# ', '')}</h1>;
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <ul key={`ul-${lIdx}`} className="list-disc pl-5 my-1 text-xs text-slate-350">
                <li>{parseInlineFormatting(line.slice(2))}</li>
              </ul>
            );
          }
          if (line.trim() === '') {
            return <div key={`empty-${lIdx}`} className="h-2"></div>;
          }
          return <p key={`p-${lIdx}`} className="text-xs text-slate-350 leading-relaxed my-1.5">{parseInlineFormatting(line)}</p>;
        });
      });
      
      return <React.Fragment key={`block-${bIdx}`}>{renderedInline}</React.Fragment>;
    });
  };

  const parseInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="bg-slate-950 px-1.5 py-0.5 rounded text-[11px] font-mono text-emerald-450 border border-slate-900">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  // Manual tweaking handlers
  const handleTestCaseChange = (index: number, key: keyof TestCase, value: any) => {
    const updated = [...testCases];
    if (key === 'input_json') {
      try {
        updated[index].input_json = JSON.parse(value);
      } catch {
        // keep typing raw
      }
    } else {
      updated[index][key] = value as any;
    }
    setTestCases(updated);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input_json: {}, expected_output: '', is_public: true }]);
  };

  const deleteTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  // Submit problem to platform API
  const handleUploadSubmit = async () => {
    if (!title.trim()) {
      setUploadError("Title is required!");
      return;
    }
    if (!descriptionMd.trim()) {
      setUploadError("Description/Question is required!");
      return;
    }
    if (!starterCode.trim()) {
      setUploadError("Starter Code is required!");
      return;
    }
    if (testCases.length === 0) {
      setUploadError("At least one testcase is required!");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const payload = {
        title,
        difficulty,
        tags,
        description_md: descriptionMd,
        theory_md: theoryMd,
        starter_code: starterCode,
        test_cases: testCases.map(tc => ({
          input_json: tc.input_json,
          expected_output: tc.expected_output,
          is_public: tc.is_public
        }))
      };

      const res = await api.post('/api/problems', payload);
      setUploadSuccess(true);
      setTimeout(() => {
        navigate(`/problems/${res.data.id}`);
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.response?.data?.detail || "Failed to create the challenge. Make sure all testcase inputs are valid JSON.");
    } finally {
      setIsUploading(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'bg-emerald-500/10 text-emerald-455 border-emerald-500/20 shadow-[0_0_15px_-4px_rgba(16,185,129,0.15)]';
      case 'medium': return 'bg-amber-500/10 text-amber-455 border-amber-500/20 shadow-[0_0_15px_-4px_rgba(245,158,11,0.15)]';
      case 'hard': return 'bg-rose-500/10 text-rose-455 border-rose-500/20 shadow-[0_0_15px_-4px_rgba(244,63,94,0.15)]';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 overflow-hidden bg-[#020617] relative">
      {/* Background Glowing Accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Upper Header Nav */}
      <div className="flex items-center justify-between border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-3 relative z-25">
        <div className="flex items-center space-x-4">
          <Link to="/problems" className="text-slate-450 hover:text-white transition-colors" title="Back to dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="h-4 w-[1px] bg-slate-800"></span>
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-450 border border-emerald-500/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <span>Problem Ingestion Engine</span>
          </h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            disabled={isUploading}
            onClick={handleUploadSubmit}
            className="flex items-center space-x-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-55 disabled:cursor-not-allowed px-5 py-2 text-xs font-bold text-slate-950 transition-all duration-200 cursor-pointer shadow-[0_4px_15px_-2px_rgba(16,185,129,0.25)]"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isUploading ? "Uploading..." : "Publish Challenge"}</span>
          </button>
        </div>
      </div>

      {/* Main split work bench */}
      <div className="flex-1 min-h-0 h-full overflow-hidden relative z-10 fade-in-up">
        <SplitPane minWidth={380} defaultWidth={640}>
          
          {/* Left panel: Bulk pasting input & editable forms */}
          <div className="flex flex-col h-full overflow-y-auto bg-slate-950/45 p-6 space-y-6 border-r border-slate-900/60 custom-scrollbar">
            
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                <span>1. Paste Challenge Text Block</span>
                <span className="text-[10px] text-emerald-450 lowercase font-medium flex items-center gap-1">
                  <Info className="h-3.5 w-3.5" /> Markdown tags are auto-parsed
                </span>
              </label>
              
              <div className="rounded-2xl border border-slate-900 bg-slate-950 p-1 focus-within:border-emerald-500/60 transition-colors">
                <textarea
                  value={bulkContent}
                  onChange={(e) => setBulkContent(e.target.value)}
                  className="w-full h-80 rounded-xl bg-transparent p-3 text-xs font-mono text-slate-200 placeholder-slate-700 focus:outline-none transition-all resize-y leading-relaxed"
                  placeholder="Paste the problem context here..."
                />
              </div>
            </div>

            <hr className="border-slate-900/60" />

            {/* Editable review section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-500" />
                <span>2. Manual Tuning Override</span>
              </h3>

              {uploadError && (
                <div className="flex items-start space-x-2 rounded-xl border border-rose-500/15 bg-rose-500/5 px-4 py-3 text-xs text-rose-400">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="flex items-center space-x-2 rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-4 py-3 text-xs text-emerald-400">
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                  <span>Success! Challenge added. Redirecting to detail view...</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Problem Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-900 bg-slate-950/40 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="Vector Add"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full rounded-xl border border-slate-900 bg-slate-950/40 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Topic Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags.join(', ')}
                  onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                  className="w-full rounded-xl border border-slate-900 bg-slate-950/40 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none transition-colors"
                  placeholder="Linear Algebra, Transformers"
                />
              </div>

              {/* Test Cases List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Test Cases ({testCases.length})
                  </label>
                  <button
                    onClick={addTestCase}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-450 hover:text-emerald-400 transition-colors"
                  >
                    <Plus className="h-3 w-3" /> Add Testcase
                  </button>
                </div>

                {testCases.map((tc, idx) => (
                  <div key={idx} className="border border-slate-900 bg-slate-950/40 p-4 rounded-2xl space-y-3 relative shadow-inner">
                    <button
                      onClick={() => deleteTestCase(idx)}
                      className="absolute top-4 right-4 text-slate-500 hover:text-rose-500 transition-colors"
                      title="Delete Test Case"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <h4 className="text-xs font-bold text-slate-400">Case #{idx + 1}</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] text-slate-500 font-mono mb-1">
                          Input JSON
                        </label>
                        <input
                          type="text"
                          value={typeof tc.input_json === 'object' ? JSON.stringify(tc.input_json) : tc.input_json}
                          onChange={(e) => handleTestCaseChange(idx, 'input_json', e.target.value)}
                          className="w-full rounded-lg border border-slate-900 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
                          placeholder='{"a": [1], "b": [2]}'
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] text-slate-500 font-mono mb-1">
                          Expected Output (string or JSON serialized)
                        </label>
                        <input
                          type="text"
                          value={tc.expected_output}
                          onChange={(e) => handleTestCaseChange(idx, 'expected_output', e.target.value)}
                          className="w-full rounded-lg border border-slate-900 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
                          placeholder='[3.0]'
                        />
                      </div>

                      <div className="flex items-center space-x-2 pt-1">
                        <input
                          type="checkbox"
                          id={`public-check-${idx}`}
                          checked={tc.is_public}
                          onChange={(e) => handleTestCaseChange(idx, 'is_public', e.target.checked)}
                          className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                        />
                        <label htmlFor={`public-check-${idx}`} className="text-xs text-slate-450 cursor-pointer select-none">
                          Is Public Testcase (Visible in solver panel)
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Right panel: WYSIWYG Platform Live Preview */}
          <div className="flex flex-col h-full bg-slate-950/20 overflow-hidden">
            {/* Live tab controls */}
            <div className="flex items-center justify-between border-b border-slate-900 bg-[#020617] px-4">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setActivePreviewTab('description')}
                  className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
                    activePreviewTab === 'description' 
                      ? 'border-emerald-400 text-emerald-450' 
                      : 'border-transparent text-slate-500 hover:text-white'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Description</span>
                </button>
                
                <button
                  onClick={() => setActivePreviewTab('theory')}
                  className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
                    activePreviewTab === 'theory' 
                      ? 'border-emerald-400 text-emerald-450' 
                      : 'border-transparent text-slate-500 hover:text-white'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Theory</span>
                </button>

                <button
                  onClick={() => setActivePreviewTab('code')}
                  className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
                    activePreviewTab === 'code' 
                      ? 'border-emerald-400 text-emerald-450' 
                      : 'border-transparent text-slate-500 hover:text-white'
                  }`}
                >
                  <Code className="h-3.5 w-3.5" />
                  <span>Starter Code</span>
                </button>

                <button
                  onClick={() => setActivePreviewTab('testcases')}
                  className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
                    activePreviewTab === 'testcases' 
                      ? 'border-emerald-400 text-emerald-450' 
                      : 'border-transparent text-slate-500 hover:text-white'
                  }`}
                >
                  <FileCode className="h-3.5 w-3.5" />
                  <span>Test Cases</span>
                </button>
              </div>

              <div className="text-[9px] bg-emerald-500/10 text-emerald-450 border border-emerald-500/25 font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider animate-pulse">
                Live Preview
              </div>
            </div>

            {/* Live tab contents */}
            <div className="flex-1 overflow-y-auto p-6 text-left custom-scrollbar bg-slate-950/20">
              {activePreviewTab === 'description' && (
                <div className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <h1 className="text-2xl font-black text-white">
                      {title || <span className="text-slate-700 italic">Untitled Challenge</span>}
                    </h1>
                    
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[9px] font-bold tracking-wide ${getDifficultyColor(difficulty)}`}>
                        {difficulty}
                      </span>
                      {tags.map((t, idx) => (
                        <span key={idx} className="rounded-full bg-slate-950 border border-slate-900 px-2.5 py-0.5 text-[9px] font-semibold text-slate-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-900 pt-5 mt-2">
                    {descriptionMd ? parseMarkdown(descriptionMd) : (
                      <p className="text-xs text-slate-650 italic">No description parsed. Please add details under a heading like ## Description.</p>
                    )}
                  </div>
                </div>
              )}

              {activePreviewTab === 'theory' && (
                <div className="space-y-4">
                  {theoryMd ? parseMarkdown(theoryMd) : (
                    <p className="text-xs text-slate-650 italic">No theory parsed. Add math definitions under a heading like ## Theory.</p>
                  )}
                </div>
              )}

              {activePreviewTab === 'code' && (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-slate-900 bg-slate-950 p-4 font-mono text-xs text-emerald-450 leading-relaxed overflow-x-auto whitespace-pre shadow-inner">
                    {starterCode || <span className="text-slate-700 italic"># No code parsed yet. Add a Python block inside a ## Starter Code heading.</span>}
                  </div>
                </div>
              )}

              {activePreviewTab === 'testcases' && (
                <div className="space-y-4">
                  {testCases.length === 0 ? (
                    <p className="text-xs text-slate-650 italic">No test cases parsed. Ensure you specify inputs and outputs under a heading like ## Test Cases.</p>
                  ) : (
                    <div className="overflow-hidden border border-slate-900 rounded-2xl bg-slate-950/40 shadow-inner">
                      <table className="min-w-full divide-y divide-slate-900 text-left">
                        <thead className="bg-[#020617] text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <tr>
                            <th className="px-4 py-3">Case</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Inputs</th>
                            <th className="px-4 py-3">Expected Output</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900 font-mono text-xs text-slate-350">
                          {testCases.map((tc, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/10">
                              <td className="px-4 py-3.5 text-slate-550 font-sans font-bold">#{idx + 1}</td>
                              <td className="px-4 py-3.5 font-sans">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg border ${
                                  tc.is_public 
                                    ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20 shadow-[0_0_15px_-4px_rgba(16,185,129,0.15)]' 
                                    : 'bg-amber-500/10 text-amber-450 border-amber-500/20 shadow-[0_0_15px_-4px_rgba(245,158,11,0.15)]'
                                }`}>
                                  {tc.is_public ? 'Public' : 'Private'}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-slate-400 truncate max-w-xs" title={JSON.stringify(tc.input_json)}>
                                {JSON.stringify(tc.input_json)}
                              </td>
                              <td className="px-4 py-3.5 text-emerald-450 truncate max-w-xs" title={tc.expected_output}>
                                {tc.expected_output}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

        </SplitPane>
      </div>
    </div>
  );
}
