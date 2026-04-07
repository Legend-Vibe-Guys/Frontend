/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

interface SignupData {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  childName?: string;
  childBirthDate?: string;
  className?: string;
}

const MOCK_TEACHER: User = {
  id: 't1',
  name: '이규현',
  role: 'teacher',
  email: 'teacher@icare.ai',
  phone: '010-1234-5678',
  className: '해바라기반',
};

const MOCK_PARENT: User = {
  id: 'p1',
  name: '김영희',
  role: 'parent',
  email: 'parent@icare.ai',
  phone: '010-2345-6789',
  childIds: ['c1'],
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  const login = useCallback(async (_email: string, _password: string, role: UserRole) => {
    setState((s) => ({ ...s, isLoading: true }));
    // Mock delay
    await new Promise((r) => setTimeout(r, 800));
    const user = role === 'teacher' ? MOCK_TEACHER : MOCK_PARENT;
    setState({ user, isAuthenticated: true, isLoading: false });
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    void data;
    setState((s) => ({ ...s, isLoading: true }));
    await new Promise((r) => setTimeout(r, 800));
    setState({ user: MOCK_TEACHER, isAuthenticated: true, isLoading: false });
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    const user = role === 'teacher' ? MOCK_TEACHER : MOCK_PARENT;
    setState({ user, isAuthenticated: true, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
