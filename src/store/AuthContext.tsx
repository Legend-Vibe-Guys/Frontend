/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User, UserRole, ApiError, LoginResponse, SignupResponse } from '../types';
import { signInWithPopup, signOut } from 'firebase/auth';
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
    isLoading: false,
  });

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

      try {
        await authAPI.signup(payload) as SignupResponse;
      } catch (signupErr: unknown) {
        const apiErr = signupErr as ApiError;
        // 409 = 이미 가입된 유저 → 그냥 로그인으로 넘어감
        if (apiErr.status !== 409) throw apiErr;
        console.warn('이미 가입된 유저입니다. 로그인으로 전환합니다.');
      }

      // 회원가입(또는 이미 가입) 후 유저 정보 조회
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
