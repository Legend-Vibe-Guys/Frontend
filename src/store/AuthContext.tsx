/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User, UserRole, ApiError, LoginResponse, SignupResponse } from '../types';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { authAPI } from '../api/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  loginWithGoogle: () => Promise<{ needsSignup: boolean }>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
}

export interface SignupData {
  name: string;
  phone: string;
  role: UserRole;
  childName?: string;
  childBirthDate?: string;
  assignedTeacher?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const res = await authAPI.login() as LoginResponse;
          setState({ user: res.user, isAuthenticated: true, isLoading: false });
        } catch (err: unknown) {
          const apiError = err as ApiError;
          if (apiError.status === 404) {
            setState({ user: null, isAuthenticated: false, isLoading: false });
          } else {
            // Error occurred
            setState({ user: null, isAuthenticated: false, isLoading: false });
          }
        }
      } else {
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    });

    return () => unsubscribe();
  }, []);


  const loginWithGoogle = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      await signInWithPopup(auth, googleProvider);
      
      try {
        const res = await authAPI.login() as LoginResponse;
        setState({ user: res.user, isAuthenticated: true, isLoading: false });
        return { needsSignup: false };
      } catch (err: unknown) {
        const apiError = err as ApiError;
        if (apiError.status === 404) {
          // 미가입 유저
          setState((s) => ({ ...s, isLoading: false }));
          return { needsSignup: true };
        }
        throw apiError;
      }
    } catch (error) {
      console.error("Login with Google failed:", error);
      setState((s) => ({ ...s, isLoading: false }));
      throw error;
    }
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const payload: Record<string, unknown> = {
        name: data.name,
        phone: data.phone,
        role: data.role,
      };

      if (data.role === 'parent') {
        payload.studentInfo = {
          kidsName: data.childName,
          birthDate: data.childBirthDate,
          teacherName: data.assignedTeacher,
        };
      }

      await authAPI.signup(payload) as SignupResponse;
      
      // 회원가입 완료 후 유저 정보를 조회하여 상태 반영
      const loginRes = await authAPI.login() as LoginResponse;
      
      setState({ user: loginRes.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error("Signup failed:", error);
      setState((s) => ({ ...s, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Firebase signout error:", e);
    }
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  if (state.isLoading) {
    return (
      <div className="w-full max-w-[430px] h-dvh mx-auto bg-white flex items-center justify-center">
         <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ ...state, loginWithGoogle, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
