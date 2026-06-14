import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../context/store';
import api from '../api';
import SplitPane from '../components/SplitPane';
import VerticalSplitPane from '../components/VerticalSplitPane';
import CodeEditor from '../components/CodeEditor';
import katex from 'katex';
import { 
  Play, 
  Send, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Bookmark, 
  BookOpen,
  Plus
} from 'lucide-react';

interface MathComponentProps {
  math: string;
  block?: boolean;
}

const MathComponent: React.FC<MathComponentProps> = ({ math, block = false }) => {
  const containerRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
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
    <div className="w-full overflow-x-auto my-4 py-2 text-center bg-gray-900/30 border border-gray-800/40 rounded-lg">
      <span ref={containerRef} />
    </div>
  ) : (
    <span ref={containerRef} />
  );
};

interface TestCase {
  id?: number;
  input_json: Record<string, any>;
  expected_output: string;
  is_public: boolean;
}

interface Problem {
  id: number;
  title: string;
  difficulty: string;
  tags: string[];
  description_md: string;
  theory_md: string;
  starter_code: string;
  test_cases: TestCase[];
}

export default function ProblemDetail() {
  const { id } = useParams<{ id: string }>();
  const problemId = Number(id);
  
  const { editorCodes, setEditorCode } = useAppStore();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Left Tabs: Description | Theory | Solution | Submissions | Notes
  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'theory' | 'submissions'>('description');
  
  // Right Bottom Tabs: Testcase | Test Result
  const [activeRightTab, setActiveRightTab] = useState<'testcase' | 'testresult'>('testcase');
  
  // Selected Test Case Index
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState(0);
  const [customTestCases, setCustomTestCases] = useState<TestCase[]>([]);
  
  // Submission & Polling State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);

  // Editor Code State
  const code = editorCodes[problemId] || '';

  // Fetch Problem Details
  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/problems/${problemId}`);
        setProblem(res.data);
        
        // Initialize custom test cases from the public ones
        if (res.data.test_cases && res.data.test_cases.length > 0) {
          setCustomTestCases(res.data.test_cases);
        } else {
          setCustomTestCases([{
            input_json: { "x": 1 },
            expected_output: "1",
            is_public: true
          }]);
        }
        
        // Initialize starter code if not already saved in state
        if (!editorCodes[problemId]) {
          setEditorCode(problemId, res.data.starter_code);
        }
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch challenge details.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProblem();
  }, [problemId]);

  // Fetch past submissions
  const fetchSubmissions = async () => {
    // Note: To implement history, we'd query submissions.
    // Let's mock a simple loader or query endpoint.
  };

  const getDifficultyColor = (diff?: string) => {
    if (!diff) return '';
    switch (diff.toLowerCase()) {
      case 'easy': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'hard': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  // Simple Markdown + LaTeX Parser
  const parseMarkdown = (text: string) => {
    if (!text) return null;
    
    // Split by block equations $$ first
    const blockParts = text.split(/\$\$(.*?)\$\$/gs);
    
    return blockParts.map((blockPart, bIdx) => {
      // If odd index, it is LaTeX block
      if (bIdx % 2 === 1) {
        return (
          <div key={`block-math-${bIdx}`} className="my-4">
            <MathComponent math={blockPart.trim()} block />
          </div>
        );
      }
      
      // Parse inline LaTeX ($...$)
      const inlineParts = blockPart.split(/\$(.*?)\$/g);
      const renderedInline = inlineParts.map((inlinePart, iIdx) => {
        if (iIdx % 2 === 1) {
          return <MathComponent key={`inline-math-${iIdx}`} math={inlinePart} />;
        }
        
        // Basic Markdown Parser (lines, headers, code block, bold)
        const lines = inlinePart.split('\n');
        return lines.map((line, lIdx) => {
          // Headers
          if (line.startsWith('### ')) {
            return <h3 key={`h3-${lIdx}`} className="text-base font-bold text-white mt-4 mb-2">{line.replace('### ', '')}</h3>;
          }
          if (line.startsWith('## ')) {
            return <h2 key={`h2-${lIdx}`} className="text-lg font-bold text-white mt-5 mb-2.5 border-b border-gray-800 pb-1">{line.replace('## ', '')}</h2>;
          }
          if (line.startsWith('# ')) {
            return <h1 key={`h1-${lIdx}`} className="text-2xl font-extrabold text-white mt-6 mb-3">{line.replace('# ', '')}</h1>;
          }
          
          // Lists
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <ul key={`ul-${lIdx}`} className="list-disc pl-5 my-1 text-sm text-gray-300">
                <li>{parseInlineFormatting(line.slice(2))}</li>
              </ul>
            );
          }
          
          // Paragraphs
          if (line.trim() === '') {
            return <div key={`empty-${lIdx}`} className="h-2"></div>;
          }
          
          return <p key={`p-${lIdx}`} className="text-sm text-gray-300 leading-relaxed my-1.5">{parseInlineFormatting(line)}</p>;
        });
      });
      
      return <React.Fragment key={`block-${bIdx}`}>{renderedInline}</React.Fragment>;
    });
  };

  const parseInlineFormatting = (text: string) => {
    // Parse bold (**text**) and inline code (`code`)
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="bg-gray-950 px-1.5 py-0.5 rounded text-xs font-mono text-emerald-400 border border-gray-800">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  // Submission submit trigger
  const handleSubmission = async () => {
    if (!problem) return;
    setIsSubmitting(true);
    setSubmissionStatus('pending');
    setSubmissionError(null);
    setSubmissionId(null);
    setActiveRightTab('testresult');

    try {
      const res = await api.post('/api/submissions/submit', {
        problem_id: problem.id,
        code: code
      });
      
      const subId = res.data.id;
      setSubmissionId(subId);
      pollSubmission(subId);
    } catch (err: any) {
      console.error(err);
      setSubmissionStatus('runtime_error');
      setSubmissionError(err.response?.data?.detail || 'Failed to submit code.');
      setIsSubmitting(false);
    }
  };

  // Poll submission status every 1s
  const pollSubmission = (subId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/api/submissions/${subId}`);
        const status = res.data.status;
        
        if (status !== 'pending') {
          clearInterval(interval);
          setSubmissionStatus(status);
          setSubmissionError(res.data.error_message);
          setIsSubmitting(false);
        }
      } catch (err) {
        clearInterval(interval);
        setSubmissionStatus('runtime_error');
        setSubmissionError('Polling failed or server connection lost.');
        setIsSubmitting(false);
      }
    }, 1000);
  };

  // Modify local testcase inputs
  const handleTestcaseChange = (key: string, value: string) => {
    const updated = [...customTestCases];
    const target = updated[selectedTestCaseIndex].input_json;
    
    // Parse numeric fields if possible
    if (!isNaN(Number(value)) && value.trim() !== '') {
      target[key] = Number(value);
    } else {
      try {
        // Try parsing JSON list/dict
        target[key] = JSON.parse(value);
      } catch {
        target[key] = value;
      }
    }
    setCustomTestCases(updated);
  };

  const addCustomTestCase = () => {
    const copy = JSON.parse(JSON.stringify(customTestCases[0] || {
      input_json: {},
      expected_output: "[]",
      is_public: true
    }));
    setCustomTestCases([...customTestCases, { ...copy, is_public: true }]);
    setSelectedTestCaseIndex(customTestCases.length);
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-62px)] items-center justify-center bg-gray-950">
        <svg className="h-8 w-8 animate-spin text-emerald-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="flex h-[calc(100vh-62px)] flex-col items-center justify-center bg-gray-950 text-gray-400">
        <AlertTriangle className="h-12 w-12 text-rose-500 mb-3" />
        <p className="text-base font-semibold">{error || 'Challenge not found'}</p>
        <Link to="/problems" className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-gray-950">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 overflow-hidden bg-gray-950">
      {/* Top Workspace Header */}
      <div className="flex items-center justify-between border-b border-gray-950/80 bg-gray-950 px-6 py-2">
        <div className="flex items-center space-x-4">
          <Link to="/problems" className="text-gray-400 hover:text-white transition-colors" title="Back to dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="h-4 w-[1px] bg-gray-800"></span>
          <h2 className="text-sm font-bold text-white">{problem.title}</h2>
          <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${getDifficultyColor(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleSubmission} // Run runs all testcases
            className="flex items-center space-x-1.5 rounded-lg border border-gray-850 hover:bg-gray-900 px-4 py-1.5 text-xs font-bold text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Run</span>
          </button>
          
          <button 
            onClick={handleSubmission}
            className="flex items-center space-x-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-4 py-1.5 text-xs font-extrabold text-gray-950 transition-colors cursor-pointer shadow-lg shadow-emerald-500/10"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Submit</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <SplitPane minWidth={350} defaultWidth={580}>
        {/* Left Side: Tabs */}
        <div className="flex flex-col h-full overflow-hidden bg-gray-950 border-r border-gray-800">
          {/* Tab Switcher */}
          <div className="flex items-center border-b border-gray-800 bg-gray-950 px-4">
            <button
              onClick={() => setActiveLeftTab('description')}
              className={`px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                activeLeftTab === 'description' 
                  ? 'border-emerald-400 text-emerald-450' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveLeftTab('theory')}
              className={`px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                activeLeftTab === 'theory' 
                  ? 'border-emerald-400 text-emerald-450' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Theory
            </button>
          </div>

          {/* Tab Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {activeLeftTab === 'description' && (
              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-extrabold text-white">{problem.title}</h1>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(problem.tags || []).map((tag) => (
                    <span key={tag} className="rounded-full bg-gray-900 border border-gray-850 px-2.5 py-0.5 text-[10px] font-semibold text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-6 border-t border-gray-900 pt-6">
                  {parseMarkdown(problem.description_md)}
                </div>
              </div>
            )}

            {activeLeftTab === 'theory' && (
              <div className="text-left space-y-4">
                {parseMarkdown(problem.theory_md)}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Monaco Code Editor + Test Runner */}
        <VerticalSplitPane minHeight={150} defaultHeight={260}>
          {/* Editor Container */}
          <div className="flex-1 overflow-hidden p-4 flex flex-col min-h-0 h-full">
            <CodeEditor 
              key={problem.id}
              defaultValue={editorCodes[problem.id] || problem.starter_code} 
              onChange={(newVal) => setEditorCode(problem.id, newVal)} 
            />
          </div>

          {/* Draggable bottom panel split */}
          <div className="h-full border-t border-gray-800 bg-gray-950 flex flex-col overflow-hidden">
            {/* Panel Tabs */}
            <div className="flex items-center justify-between border-b border-gray-800 bg-gray-950/60 px-4">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setActiveRightTab('testcase')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                    activeRightTab === 'testcase' 
                      ? 'border-emerald-400 text-emerald-450' 
                      : 'border-transparent text-gray-500 hover:text-white'
                  }`}
                >
                  Testcase
                </button>
                <button
                  onClick={() => setActiveRightTab('testresult')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                    activeRightTab === 'testresult' 
                      ? 'border-emerald-400 text-emerald-450' 
                      : 'border-transparent text-gray-500 hover:text-white'
                  }`}
                >
                  Test Result
                </button>
              </div>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-950">
              {activeRightTab === 'testcase' && customTestCases.length > 0 && (
                <div className="text-left space-y-3">
                  {/* Case select tabs */}
                  <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-900 pb-2 mb-3">
                    {customTestCases.map((tc, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedTestCaseIndex(idx)}
                        className={`rounded-lg px-3 py-1 text-xs font-semibold border transition-all cursor-pointer ${
                          selectedTestCaseIndex === idx
                            ? 'bg-gray-800 text-white border-gray-700'
                            : 'border-transparent bg-gray-950 text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        Case {idx + 1} {!tc.is_public && <span className="text-[9px] text-gray-650">(Private)</span>}
                      </button>
                    ))}
                    <button 
                      onClick={addCustomTestCase}
                      className="rounded-lg p-1 hover:bg-gray-900 border border-transparent hover:border-gray-800 text-gray-500 hover:text-white cursor-pointer"
                      title="Add Custom Test Case"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Input Fields */}
                  <div className="space-y-3">
                    {Object.entries(customTestCases[selectedTestCaseIndex]?.input_json || {}).map(([key, val]) => (
                      <div key={key} className="max-w-md">
                        <label className="block text-[11px] font-mono text-gray-500 lowercase mb-1">
                          {key} =
                        </label>
                        <input
                          type="text"
                          value={typeof val === 'object' ? JSON.stringify(val) : val}
                          onChange={(e) => handleTestcaseChange(key, e.target.value)}
                          className="w-full rounded-lg border border-gray-800 bg-gray-900/40 px-3.5 py-1.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeRightTab === 'testresult' && (
                <div className="text-left h-full flex flex-col justify-between">
                  {/* Pending state banner */}
                  {submissionStatus === 'pending' && (
                    <div className="flex flex-col items-center justify-center h-full py-6">
                      <Clock className="h-7 w-7 text-emerald-450 animate-pulse mb-2" />
                      <p className="text-xs text-gray-400 font-semibold">Running judge runner execution...</p>
                      <span className="text-[10px] text-gray-600 mt-1">Polling status every 1s</span>
                    </div>
                  )}

                  {/* Accepted results */}
                  {submissionStatus === 'accepted' && (
                    <div className="space-y-2.5 h-full">
                      <div className="flex items-center space-x-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-emerald-400 shadow-md">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        <div>
                          <p className="text-sm font-bold">Accepted</p>
                          <p className="text-[10px] text-emerald-500/80">All test cases passed successfully.</p>
                        </div>
                      </div>
                      <div className="rounded-lg bg-gray-950 border border-gray-850 p-3 text-xs font-mono text-gray-400 mt-2">
                        Stdout: Correct output matched target.
                      </div>
                    </div>
                  )}

                  {/* Wrong Answer results */}
                  {submissionStatus === 'wrong_answer' && (
                    <div className="space-y-2 h-full">
                      <div className="flex items-center space-x-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-rose-450 shadow-md">
                        <XCircle className="h-5 w-5 shrink-0" />
                        <div>
                          <p className="text-sm font-bold">Wrong Answer</p>
                          <p className="text-[10px] text-rose-500/80">Output mismatched the expected test results.</p>
                        </div>
                      </div>
                      <div className="rounded-lg bg-[#0e0205] border border-rose-950/20 p-3.5 text-xs font-mono text-rose-300 mt-2 whitespace-pre-wrap">
                        {submissionError}
                      </div>
                    </div>
                  )}

                  {/* Runtime Error / Error results */}
                  {(submissionStatus === 'runtime_error' || submissionStatus === 'time_limit_exceeded') && (
                    <div className="space-y-2 h-full">
                      <div className="flex items-center space-x-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-amber-450 shadow-md">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <div>
                          <p className="text-sm font-bold uppercase">
                            {submissionStatus === 'time_limit_exceeded' ? 'Time Limit Exceeded' : 'Runtime Error'}
                          </p>
                          <p className="text-[10px] text-amber-500/80 font-semibold">Your Python script failed during execution.</p>
                        </div>
                      </div>
                      <div className="rounded-lg bg-[#0d0a02] border border-amber-950/20 p-3.5 text-xs font-mono text-amber-300 mt-2 whitespace-pre-wrap">
                        {submissionError}
                      </div>
                    </div>
                  )}

                  {/* Static empty state when no runs */}
                  {!submissionStatus && (
                    <div className="flex flex-col items-center justify-center h-full py-8 text-gray-600">
                      <FileText className="h-8 w-8 mb-2" />
                      <p className="text-xs font-semibold">No execution results.</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Click "Run" or "Submit" to grade your code.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </VerticalSplitPane>
      </SplitPane>
    </div>
  );
}
