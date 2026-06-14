import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { 
  BrainCircuit, 
  CheckCircle2, 
  Lock, 
  Play, 
  ArrowRight, 
  BookOpen, 
  Database, 
  FileText, 
  Search, 
  Cpu, 
  Award, 
  Info, 
  Sparkles, 
  FileCode 
} from 'lucide-react';

interface Problem {
  id: number;
  title: string;
  difficulty: string;
  tags: string[];
}

interface Step {
  stepNumber: number;
  title: string;
  description: string;
  concept: string;
  icon: React.ReactNode;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  seedTitle: string;
}

export default function RagPathway() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeVisualNode, setActiveVisualNode] = useState<number | null>(null);

  // Map out the 6 progressive learning steps matching the ingestion -> parsing -> chunking -> embeddings -> FAISS -> retrieval -> LLM pipeline
  const steps: Step[] = [
    {
      stepNumber: 1,
      title: "Document Parsing",
      description: "Decodes base64 PDF and Word files into clean plain text.",
      concept: "Ingestion layer, PDF binary structures, and Word document parsing.",
      icon: <FileText className="h-6 w-6" />,
      difficulty: "Medium",
      seedTitle: "RAG: Document Parsing (PDF and DOCX)"
    },
    {
      stepNumber: 2,
      title: "Fixed-Length Chunking",
      description: "Segments parsed plain text into fixed-size windows with sliding character overlap.",
      concept: "Text chunking, sliding windows, and semantic context protection.",
      icon: <FileCode className="h-6 w-6" />,
      difficulty: "Easy",
      seedTitle: "RAG: Fixed-Length Chunking"
    },
    {
      stepNumber: 3,
      title: "Semantic Embeddings",
      description: "Converts text chunks and queries into dense vector embeddings using SentenceTransformers.",
      concept: "Pre-trained SentenceTransformer representations and vector dimensions.",
      icon: <BrainCircuit className="h-6 w-6" />,
      difficulty: "Medium",
      seedTitle: "RAG: Semantic Embeddings (SentenceTransformer)"
    },
    {
      stepNumber: 4,
      title: "FAISS Vector Storage",
      description: "Initializes a flat L2 index in Meta's FAISS library and loads the document vectors.",
      concept: "FAISS vector databases, IndexFlatL2 initialization, and float32 conversions.",
      icon: <Database className="h-6 w-6" />,
      difficulty: "Medium",
      seedTitle: "RAG: FAISS Vector Database Storage"
    },
    {
      stepNumber: 5,
      title: "FAISS Vector Retrieval",
      description: "Performs nearest-neighbor search in the L2 vector database to retrieve the top k matches.",
      concept: "Exact L2 distance searches and vector query matching.",
      icon: <Search className="h-6 w-6" />,
      difficulty: "Medium",
      seedTitle: "RAG: FAISS Vector Database Retrieval"
    },
    {
      stepNumber: 6,
      title: "End-to-End System Pipeline",
      description: "Chains all stages together: decoding, parsing, chunking, embedding, indexing, retrieval, and grounded LLM query generation.",
      concept: "Complex multi-component RAG systems and context window constraints.",
      icon: <Sparkles className="h-6 w-6" />,
      difficulty: "Hard",
      seedTitle: "RAG: End-to-End System Pipeline"
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [probsRes, completedRes] = await Promise.all([
          api.get('/api/problems'),
          api.get('/api/submissions/completed-ids')
        ]);
        setProblems(probsRes.data);
        setCompletedIds(completedRes.data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load pathway data. Please check that the server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Find problem ID from seeded title
  const getProblemForStep = (step: Step) => {
    return problems.find(p => p.title === step.seedTitle);
  };

  const isStepCompleted = (step: Step) => {
    const prob = getProblemForStep(step);
    return prob ? completedIds.includes(prob.id) : false;
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'hard': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const completedCount = steps.filter(isStepCompleted).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center">
          <svg className="h-8 w-8 animate-spin text-emerald-450" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="mt-4 text-sm text-gray-400">Loading RAG Pathway...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-red-400">
          <p className="text-sm font-semibold">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-950 text-gray-100 pb-16">
      {/* Hero Header Section */}
      <div className="relative border-b border-gray-900 bg-gray-950/40 py-12 px-6 backdrop-blur-sm">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px]" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
        </div>
        
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="text-left max-w-2xl">
            <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs text-emerald-450 mb-4 font-semibold tracking-wide">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ingestion-to-Generation Architecture</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              RAG Academy
            </h1>
            <p className="mt-3 text-base text-gray-400 leading-relaxed">
              Retrieval-Augmented Generation (RAG) bridges static LLM models with raw private database documents (PDFs, DOCX).
              By solving these 6 progressive challenges, you will construct a production-ready RAG application pipeline featuring real document ingestion, SentenceTransformer embedding math, and FAISS indexing.
            </p>
          </div>
          
          {/* Progress Tracker Card */}
          <div className="w-full md:w-80 border border-gray-800 bg-gray-900/40 p-6 rounded-2xl backdrop-blur-md shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-400">Your Progress</span>
                <span className="text-sm font-bold text-emerald-450">{completedCount} / {steps.length} Steps</span>
              </div>
              <div className="w-full bg-gray-950 rounded-full h-2.5 overflow-hidden border border-gray-850">
                <div 
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            
            <div className="mt-6 border-t border-gray-850 pt-4 flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs text-gray-400">
                <Award className="h-4 w-4 text-amber-500" />
                <span>Certificate Status</span>
              </div>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                progressPercent === 100 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-gray-950 text-gray-500 border-gray-800'
              }`}>
                {progressPercent === 100 ? 'Unlocked' : 'In Progress'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RAG Flow Visualizer */}
      <div className="mx-auto max-w-6xl px-6 mt-12">
        <div className="border border-gray-900 bg-gray-900/20 p-6 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-6">
            <Info className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Interactive Pipeline Architecture</h2>
          </div>
          
          {/* Interactive Flow Diagram */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 py-6 px-4 bg-gray-950/40 border border-gray-900 rounded-xl">
            
            {/* Step 1 Node (Document Parsing) */}
            <div 
              onMouseEnter={() => setActiveVisualNode(1)}
              onMouseLeave={() => setActiveVisualNode(null)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer h-28 ${
                isStepCompleted(steps[0])
                  ? 'bg-emerald-500/5 border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-500/5'
                  : activeVisualNode === 1
                  ? 'bg-gray-900 border-gray-700 text-white'
                  : 'bg-gray-950 border-gray-900 text-gray-500 hover:border-gray-850'
              }`}
            >
              <FileText className="h-5 w-5 mb-2" />
              <span className="text-[11px] font-bold leading-tight">1. Parsing</span>
              <span className="text-[9px] text-gray-500 mt-1">PDF & DOCX to text</span>
            </div>

            {/* Step 2 Node (Fixed-Length Chunking) */}
            <div 
              onMouseEnter={() => setActiveVisualNode(2)}
              onMouseLeave={() => setActiveVisualNode(null)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer h-28 ${
                isStepCompleted(steps[1])
                  ? 'bg-emerald-500/5 border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-500/5'
                  : activeVisualNode === 2
                  ? 'bg-gray-900 border-gray-700 text-white'
                  : 'bg-gray-950 border-gray-900 text-gray-500 hover:border-gray-850'
              }`}
            >
              <FileCode className="h-5 w-5 mb-2" />
              <span className="text-[11px] font-bold leading-tight">2. Chunking</span>
              <span className="text-[9px] text-gray-500 mt-1">Fixed window overlap</span>
            </div>

            {/* Step 3 Node (Semantic Embeddings) */}
            <div 
              onMouseEnter={() => setActiveVisualNode(3)}
              onMouseLeave={() => setActiveVisualNode(null)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer h-28 ${
                isStepCompleted(steps[2])
                  ? 'bg-emerald-500/5 border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-500/5'
                  : activeVisualNode === 3
                  ? 'bg-gray-900 border-gray-700 text-white'
                  : 'bg-gray-950 border-gray-900 text-gray-500 hover:border-gray-850'
              }`}
            >
              <BrainCircuit className="h-5 w-5 mb-2" />
              <span className="text-[11px] font-bold leading-tight">3. Embeddings</span>
              <span className="text-[9px] text-gray-500 mt-1">Dense semantic vector</span>
            </div>

            {/* Step 4 Node (FAISS Vector Storage) */}
            <div 
              onMouseEnter={() => setActiveVisualNode(4)}
              onMouseLeave={() => setActiveVisualNode(null)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer h-28 ${
                isStepCompleted(steps[3])
                  ? 'bg-emerald-500/5 border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-500/5'
                  : activeVisualNode === 4
                  ? 'bg-gray-900 border-gray-700 text-white'
                  : 'bg-gray-950 border-gray-900 text-gray-500 hover:border-gray-850'
              }`}
            >
              <Database className="h-5 w-5 mb-2" />
              <span className="text-[11px] font-bold leading-tight">4. FAISS DB</span>
              <span className="text-[9px] text-gray-500 mt-1">Flat L2 IndexFlatL2</span>
            </div>

            {/* Step 5 Node (FAISS Vector Retrieval) */}
            <div 
              onMouseEnter={() => setActiveVisualNode(5)}
              onMouseLeave={() => setActiveVisualNode(null)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer h-28 ${
                isStepCompleted(steps[4])
                  ? 'bg-emerald-500/5 border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-500/5'
                  : activeVisualNode === 5
                  ? 'bg-gray-900 border-gray-700 text-white'
                  : 'bg-gray-950 border-gray-900 text-gray-500 hover:border-gray-850'
              }`}
            >
              <Search className="h-5 w-5 mb-2" />
              <span className="text-[11px] font-bold leading-tight">5. Retrieval</span>
              <span className="text-[9px] text-gray-500 mt-1">K-nearest neighbor search</span>
            </div>

            {/* Step 6 Node (End-to-End System Pipeline) */}
            <div 
              onMouseEnter={() => setActiveVisualNode(6)}
              onMouseLeave={() => setActiveVisualNode(null)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer h-28 ${
                isStepCompleted(steps[5])
                  ? 'bg-emerald-500/5 border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-500/5'
                  : activeVisualNode === 6
                  ? 'bg-gray-900 border-gray-700 text-white'
                  : 'bg-gray-950 border-gray-900 text-gray-500 hover:border-gray-850'
              }`}
            >
              <Sparkles className="h-5 w-5 mb-2" />
              <span className="text-[11px] font-bold leading-tight">6. E2E System</span>
              <span className="text-[9px] text-gray-500 mt-1">Query grounding & LLM</span>
            </div>

          </div>
          <p className="text-[11px] text-gray-500 mt-3 text-center">
            *Hover over diagram blocks to highlight concepts. Complete challenges to light up the architecture flow in emerald!
          </p>
        </div>
      </div>

      {/* Sequential Learning Timeline */}
      <div className="mx-auto max-w-6xl px-6 mt-12 text-left">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2.5">
          <BookOpen className="h-5 w-5 text-emerald-450" />
          <span>RAG Coding Roadmap</span>
        </h2>
        
        <div className="relative border-l border-gray-850 pl-6 ml-4 space-y-8">
          {steps.map((step, index) => {
            const problem = getProblemForStep(step);
            const isCompleted = isStepCompleted(step);
            const isVisualActive = activeVisualNode === step.stepNumber;
            
            return (
              <div 
                key={step.stepNumber} 
                className={`relative transition-all duration-200 ${
                  isVisualActive ? 'scale-[1.01] translate-x-1' : ''
                }`}
              >
                {/* Timeline Dot Indicator */}
                <div className={`absolute -left-[37px] top-1 flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
                  isCompleted 
                    ? 'bg-emerald-500 border-emerald-500 text-gray-950' 
                    : 'bg-gray-950 border-gray-800 text-gray-650'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                  ) : (
                    <span className="text-xs font-extrabold font-mono">{step.stepNumber}</span>
                  )}
                </div>
                
                {/* Roadmap Card */}
                <div className={`rounded-xl border bg-gray-900/10 p-6 backdrop-blur-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all ${
                  isVisualActive 
                    ? 'border-emerald-500/50 bg-gray-900/30 shadow-lg shadow-emerald-500/2' 
                    : 'border-gray-850 hover:border-gray-800'
                }`}>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-emerald-450 uppercase tracking-widest font-mono">Step {step.stepNumber}</span>
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${getDifficultyColor(step.difficulty)}`}>
                        {step.difficulty}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white">{step.title}</h3>
                    <p className="mt-1 text-sm text-gray-400 leading-relaxed">{step.description}</p>
                    
                    <div className="mt-3.5 flex items-center space-x-1.5 text-xs text-gray-500 bg-gray-950/30 border border-gray-850/40 rounded-lg px-3 py-1.5 w-fit">
                      <span className="font-semibold text-emerald-450/80">Key Concept:</span>
                      <span>{step.concept}</span>
                    </div>
                  </div>
                  
                  {/* Solve button / Status */}
                  <div className="shrink-0">
                    {problem ? (
                      <Link
                        to={`/problems/${problem.id}`}
                        className={`inline-flex items-center space-x-2 rounded-lg border px-5 py-2.5 text-xs font-bold transition-all ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-emerald-500 text-gray-950 border-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/5'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Review Code</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 fill-current" />
                            <span>Solve Challenge</span>
                          </>
                        )}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <div className="inline-flex items-center space-x-2 rounded-lg bg-gray-900 border border-gray-850 px-4 py-2 text-xs font-semibold text-gray-600">
                        <Lock className="h-4 w-4" />
                        <span>Not Available</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
