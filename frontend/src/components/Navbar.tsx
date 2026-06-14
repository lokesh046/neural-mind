import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../context/store';
import { Code2, LogOut, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { token, user, logout } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-900 bg-[#020617]/75 backdrop-blur-md px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand Logo */}
        <Link to="/problems" className="flex items-center space-x-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 transition-all duration-200 group-hover:scale-105 group-hover:border-emerald-500/50 shadow-[0_0_15px_-4px_rgba(16,185,129,0.25)]">
            <Code2 className="h-5 w-5" />
          </div>
          <span className="text-lg font-black tracking-tight text-white transition-colors duration-200 group-hover:text-emerald-450">
            Neural<span className="text-emerald-455">Mind</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            to="/problems"
            className={`text-xs uppercase tracking-wider font-bold transition-all duration-200 hover:text-white ${
              isActive('/problems') ? 'text-emerald-450' : 'text-slate-400'
            }`}
          >
            Problems
          </Link>
          <Link
            to="/rag"
            className={`text-xs uppercase tracking-wider font-bold transition-all duration-200 hover:text-white flex items-center space-x-1.5 ${
              isActive('/rag') ? 'text-emerald-450' : 'text-slate-400'
            }`}
          >
            <span>RAG Academy</span>
            <span className="text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-450 border border-emerald-500/30 px-1 py-0.2 rounded-lg tracking-wide animate-pulse">
              Path
            </span>
          </Link>
          <Link
            to="/problems/upload"
            className={`text-xs uppercase tracking-wider font-bold transition-all duration-200 hover:text-white ${
              isActive('/problems/upload') ? 'text-emerald-450' : 'text-slate-400'
            }`}
          >
            Upload
          </Link>
          <div className="relative group/menu flex items-center space-x-1 cursor-pointer text-slate-400 hover:text-white text-xs uppercase tracking-wider font-bold">
            <span>Explore</span>
            <ChevronDown className="h-3.5 w-3.5" />
            <div className="absolute top-full left-0 mt-2.5 hidden group-hover/menu:block w-48 rounded-xl border border-slate-900 bg-slate-950 p-2.5 shadow-2xl animate-in fade-in duration-150">
              <Link to="/problems" className="block rounded-lg p-2 text-xs font-semibold text-slate-350 hover:bg-slate-900/60 hover:text-white">
                Study Plans
              </Link>
              <Link to="/problems" className="block rounded-lg p-2 text-xs font-semibold text-slate-350 hover:bg-slate-900/60 hover:text-white">
                Interview Prep
              </Link>
            </div>
          </div>
          <Link
            to="#"
            className="text-xs uppercase tracking-wider font-bold text-slate-400 hover:text-white transition-colors duration-205"
          >
            Pricing
          </Link>
        </div>

        {/* User Info / Auth Actions */}
        <div className="flex items-center space-x-4">
          {token && user ? (
            <div className="flex items-center space-x-4">
              {/* User display */}
              <div className="flex items-center space-x-2 bg-slate-900/40 border border-slate-900 px-3.5 py-1.5 rounded-xl shadow-inner">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-450 text-[10px] font-extrabold">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-xs font-bold text-slate-300">{user.username}</span>
              </div>
              
              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 rounded-xl border border-slate-900 hover:border-rose-500/25 hover:bg-rose-500/10 px-3.5 py-1.5 text-xs font-bold text-slate-400 hover:text-rose-455 transition-all duration-200 cursor-pointer"
                title="Log out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3.5">
              <Link
                to="/login"
                className="text-xs font-bold text-slate-450 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-emerald-500 hover:bg-emerald-450 px-4 py-2 text-xs font-extrabold text-slate-950 transition-colors shadow-lg shadow-emerald-500/10"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
