import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './context/store';
import api from './api';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Problems from './pages/Problems';
import ProblemDetail from './pages/ProblemDetail';
import RagPathway from './pages/RagPathway';
import UploadProblem from './pages/UploadProblem';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token } = useAppStore();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  const { token, setUser, logout } = useAppStore();
  const [initializing, setInitializing] = useState(!!token);

  useEffect(() => {
    const restoreSession = async () => {
      if (token) {
        try {
          const res = await api.get('/api/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Failed to restore user session:', err);
          logout();
        }
      }
      setInitializing(false);
    };

    restoreSession();
  }, [token]);

  if (initializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <svg className="h-8 w-8 animate-spin text-emerald-450" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="h-screen bg-gray-950 text-gray-100 flex flex-col font-sans antialiased overflow-hidden">
        <Navbar />
        <main className="flex-1 flex flex-col overflow-hidden min-h-0">
          <Routes>
            <Route 
              path="/login" 
              element={token ? <Navigate to="/problems" replace /> : <Login />} 
            />
            <Route 
              path="/register" 
              element={token ? <Navigate to="/problems" replace /> : <Register />} 
            />
            <Route 
              path="/problems" 
              element={
                <ProtectedRoute>
                  <Problems />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/problems/upload" 
              element={
                <ProtectedRoute>
                  <UploadProblem />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/problems/:id" 
              element={
                <ProtectedRoute>
                  <ProblemDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/rag" 
              element={
                <ProtectedRoute>
                  <RagPathway />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/problems" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
