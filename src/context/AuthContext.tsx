import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextValue {
  firebaseUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  signInWithEmail: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<{ ok: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ ok: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function formatFirebaseAuthError(code?: string, fallback?: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email address or password. Please verify your administrator credentials.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a few minutes or reset your password.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not yet enabled in Firebase Authentication. Enable Email/Password in your Firebase Console (Authentication → Sign-in method) or sign in with your authorized Google account below.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completion.';
    default:
      return fallback || 'Authentication failed. Please try again.';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const syncProfile = async (user: User | null): Promise<UserProfile | null> => {
    if (!user) {
      setProfile(null);
      return null;
    }
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || 'Failed to verify user profile');
      }
      const data = await res.json();
      const synced: UserProfile | null = data.user || null;
      setProfile(synced);
      setAuthError(null);
      return synced;
    } catch (err: any) {
      console.error('Auth sync error:', err);
      setAuthError(err.message || 'Authentication check failed');
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      await syncProfile(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (
    email: string,
    password: string,
    rememberMe: boolean
  ): Promise<{ ok: boolean; error?: string }> => {
    setAuthError(null);
    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      const synced = await syncProfile(result.user);
      if (!synced || synced.role !== 'admin') {
        await firebaseSignOut(auth);
        setProfile(null);
        const msg = 'Access denied. Only authorized administrators can sign in.';
        setAuthError(msg);
        return { ok: false, error: msg };
      }
      return { ok: true };
    } catch (err: any) {
      const msg = formatFirebaseAuthError(err?.code, err?.message);
      setAuthError(msg);
      return { ok: false, error: msg };
    }
  };

  const resetPassword = async (
    email: string
  ): Promise<{ ok: boolean; error?: string }> => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { ok: true };
    } catch (err: any) {
      const msg = formatFirebaseAuthError(err?.code, err?.message);
      return { ok: false, error: msg };
    }
  };

  const signInWithGoogle = async (): Promise<{ ok: boolean; error?: string }> => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const synced = await syncProfile(result.user);
      if (!synced || synced.role !== 'admin') {
        await firebaseSignOut(auth);
        setProfile(null);
        const msg =
          'Access denied. This Google account is not authorized as a Khulna Vlogs administrator.';
        setAuthError(msg);
        return { ok: false, error: msg };
      }
      return { ok: true };
    } catch (err: any) {
      const msg = formatFirebaseAuthError(err?.code, err?.message);
      setAuthError(msg);
      return { ok: false, error: msg };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setProfile(null);
    setAuthError(null);
  };

  const getIdToken = async () => {
    if (!firebaseUser) return null;
    return firebaseUser.getIdToken();
  };

  const refreshProfile = async () => {
    await syncProfile(firebaseUser);
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        loading,
        authError,
        signInWithEmail,
        resetPassword,
        signInWithGoogle,
        signOut,
        getIdToken,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
