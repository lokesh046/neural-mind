import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Search, SlidersHorizontal, BookOpen, BrainCircuit, Plus, Trash2, ChevronRight } from 'lucide-react';

interface Problem {
  id: number;
  title: string;
  difficulty: string;
  tags: string[];
}

export default function Problems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  // Deletion state
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleDeleteProblem = async (problemId: number) => {
    try {
      await api.delete(`/api/problems/${problemId}`);
      setProblems(problems.filter(p => p.id !== problemId));
      setDeleteConfirmId(null);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to delete problem.");
      setDeleteConfirmId(null);
    }
  };

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await api.get('/api/problems');
        setProblems(res.data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load problems. Please make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const getDifficultyColor = (diff: string | undefined | null) => {
    if (!diff) return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    switch (diff.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.15)]';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_-3px_rgba(245,158,11,0.15)]';
      case 'hard':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_-3px_rgba(244,63,94,0.15)]';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const filteredProblems = problems.filter((prob) => {
    const title = prob.title || '';
    const difficulty = prob.difficulty || '';
    const tags = prob.tags || [];
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tags.some(tag => tag && tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDifficulty = selectedDifficulty === 'All' || difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#020617] pb-24 relative min-h-0">
      {/* Background Glowing Accents */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="mx-auto max-w-6xl px-6 py-12 relative z-10 fade-in-up">
        {/* Header Info */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="text-left space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-450 border border-emerald-500/30 shadow-[0_0_20px_-3px_rgba(16,185,129,0.3)]">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Machine Learning Challenges
              </span>
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Crack core tensor equations, code positional encodings, build document chunkers, and deploy meta FAISS retrieval engines in real time.
            </p>
          </div>
          <Link
            to="/problems/upload"
            className="inline-flex items-center space-x-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 text-xs font-bold text-slate-950 transition-all duration-200 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.3)] hover:scale-[1.02] cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Upload Challenge</span>
          </Link>
        </div>

        {/* Search and Filters bar */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border border-slate-900 bg-slate-950/40 p-4 rounded-2xl backdrop-blur-md shadow-xl">
          <div className="relative flex-1 max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search problems, keywords, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-900 bg-slate-950/60 py-2.5 pl-11 pr-4 text-xs text-white placeholder-slate-650 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200"
            />
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <SlidersHorizontal className="h-4 w-4 text-slate-500 mr-2" />
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                  selectedDifficulty === diff
                    ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/35 shadow-[0_0_15px_-4px_rgba(16,185,129,0.2)]'
                    : 'border-slate-900 bg-slate-950/20 text-slate-400 hover:text-white hover:border-slate-800'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Problems Grid / Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <svg className="h-10 w-10 animate-spin text-emerald-450" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Compiling Dashboard...</span>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-500/15 bg-rose-500/5 p-8 text-center max-w-xl mx-auto shadow-2xl">
            <p className="text-sm font-semibold text-rose-400">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-5 rounded-xl bg-rose-500/10 border border-rose-500/20 px-5 py-2.5 text-xs font-bold text-rose-450 hover:bg-rose-500/20 transition-all duration-200"
            >
              Reconnect Node
            </button>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="rounded-2xl border border-slate-900 bg-slate-950/20 py-20 text-center shadow-lg">
            <BookOpen className="mx-auto h-12 w-12 text-slate-700 mb-4" />
            <h3 className="text-base font-bold text-slate-400">No challenges found</h3>
            <p className="mt-1.5 text-xs text-slate-550 max-w-xs mx-auto leading-relaxed">Adjust your difficulty filters or search query and try again.</p>
          </div>
        ) : (
          <div className="overflow-hidden border border-slate-900 bg-slate-950/10 rounded-2xl shadow-2xl backdrop-blur-md">
            <table className="min-w-full divide-y divide-slate-900 text-left">
              <thead className="bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4.5">Challenge Title</th>
                  <th className="px-6 py-4.5">Difficulty</th>
                  <th className="px-6 py-4.5">Topic Tags</th>
                  <th className="px-6 py-4.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 bg-slate-950/10">
                {filteredProblems.map((prob) => (
                  <tr 
                    key={prob.id} 
                    className="group hover:bg-slate-900/20 transition-colors duration-200"
                  >
                    <td className="px-6 py-5.5">
                      <Link 
                        to={`/problems/${prob.id}`}
                        className="text-sm font-semibold text-slate-200 hover:text-emerald-450 transition-colors duration-150 block"
                      >
                        {prob.title}
                      </Link>
                    </td>
                    <td className="px-6 py-5.5">
                      <span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[10px] font-bold tracking-wide ${getDifficultyColor(prob.difficulty)}`}>
                        {prob.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-5.5">
                      <div className="flex flex-wrap gap-1.5">
                        {(prob.tags || []).map((tag) => (
                          <span 
                            key={tag} 
                            className="rounded-full border border-slate-900 bg-slate-950 px-2.5 py-0.5 text-[9px] font-medium text-slate-400 shadow-inner"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5.5 text-right flex items-center justify-end space-x-3.5">
                      <Link
                        to={`/problems/${prob.id}`}
                        className="inline-flex items-center space-x-1 rounded-xl bg-slate-900 border border-slate-800 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500 px-4 py-2 text-xs font-bold text-emerald-450 transition-all duration-200 cursor-pointer shadow-md"
                      >
                        <span>Solve</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => setDeleteConfirmId(prob.id)}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-900 hover:border-rose-500/30 hover:bg-rose-500/10 p-2 text-slate-500 hover:text-rose-450 transition-all duration-200 cursor-pointer"
                        title="Delete Challenge"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-850 bg-slate-950 p-6 shadow-2xl animate-in fade-in duration-200 text-left">
            <h3 className="text-base font-extrabold text-white mb-1.5">Delete Challenge?</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Are you sure you want to delete this challenge? This will remove all associated test cases and user submissions permanently.
            </p>
            
            <div className="flex items-center justify-end space-x-2.5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl border border-slate-800 hover:bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProblem(deleteConfirmId)}
                className="rounded-xl bg-red-500 hover:bg-red-600 px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer shadow-md shadow-red-500/10"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
