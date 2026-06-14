import { create } from 'zustand';

interface User {
  id: number;
  email: string;
  username: string;
}

interface AppState {
  token: string | null;
  user: User | null;
  editorCodes: Record<number, string>;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setEditorCode: (problemId: number, code: string) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  token: localStorage.getItem('token'),
  user: null,
  editorCodes: JSON.parse(localStorage.getItem('editorCodes') || '{}'),
  
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },
  
  setUser: (user) => set({ user }),
  
  setEditorCode: (problemId, code) => set((state) => {
    const updatedCodes = { ...state.editorCodes, [problemId]: code };
    localStorage.setItem('editorCodes', JSON.stringify(updatedCodes));
    return { editorCodes: updatedCodes };
  }),
  
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  }
}));
