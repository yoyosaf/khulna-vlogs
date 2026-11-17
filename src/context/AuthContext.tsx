import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  browserLocalPersistence,
  browserSessionPersistence,
  getRedirectResult,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthActionResult {
  ok: boolean;
  error?: string;
  errorCode?: string;
}

interface AuthContextValue {
  firebaseUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  signInWithEmail: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<AuthActionResult>;
  resetPassword: (email: string) => Promise<AuthActionResult>;
  signInWithGoogle: () => Promise<AuthActionResult>;
  signInWithGoogleRedirect: () => Promise<AuthActionResult>;
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
    case 'auth/cancelled-popup-request':
      return 'Sign-in popup request was cancelled. Click the button once and complete sign-in in the popup.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google Sign-In popup window. Allow pop-ups for this site in Chrome, or use the fallback option below.';
    case 'auth/unauthorized-domain': {
      const host =
        typeof window !== 'undefined' ? window.location.hostname : 'this domain';
      return `Domain "${host}" is not authorized in Firebase Authentication yet. Add "${host}" in Firebase Console (project: eternal-episode-sw2pc) → Authentication → Settings → Authorized domains.`;
    }
    default:
      return fallback || 'Authentication failed. Please try again.';
  }
}

interface SyncProfileResult {
  user: UserProfile | null;
  error?: string;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const syncProfile = async (user: User | null): Promise<SyncProfileResult> => {
    if (!user) {
      setProfile(null);
      return { user: null };
    }
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const contentType = res.headers.get('content-type') || '';
      if (
        res.status === 404 ||
        res.status === 405 ||
        !contentType.includes('application/json')
      ) {
        throw new Error(
          'Admin login requires the full-stack backend server (open your AI Studio app URL). Static hosting like Vercel cannot run server.ts or Cloud SQL.'
        );
      }
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || 'Failed to verify user profile');
      }
      const data = await res.json();
      const synced: UserProfile | null = data.user || null;
      setProfile(synced);
      setAuthError(null);
      return { user: synced };
    } catch (err: any) {
      const message = err?.message || 'Authentication check failed';
      console.error('Auth sync error:', err);
      setAuthError(message);
      setProfile(null);
      return { user: null, error: message };
    }
  };

  useEffect(() => {
    let mounted = true;

    getRedirectResult(auth)
      .then(async (result) => {
        if (!mounted || !result?.user) return;
        const syncResult = await syncProfile(result.user);
        if (syncResult.error) {
          await firebaseSignOut(auth);
          if (mounted) {
            setProfile(null);
            setAuthError(syncResult.error);
          }
          return;
        }
        if (!syncResult.user || syncResult.user.role !== 'admin') {
          await firebaseSignOut(auth);
          if (mounted) {
            setProfile(null);
            setAuthError(
              'Access denied. This Google account is not authorized as a Khulna Vlogs administrator.'
            );
          }
        }
      })
      .catch((err: any) => {
        if (!mounted) return;
        if (err?.code) {
          setAuthError(formatFirebaseAuthError(err.code, err.message));
        }
      });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;
      setFirebaseUser(user);
      await syncProfile(user);
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const signInWithEmail = async (
    email: string,
    password: string,
    rememberMe: boolean
  ): Promise<AuthActionResult> => {
    setAuthError(null);
    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      const syncResult = await syncProfile(result.user);
      if (syncResult.error) {
        await firebaseSignOut(auth);
        setProfile(null);
        setAuthError(syncResult.error);
        return { ok: false, error: syncResult.error };
      }
      if (!syncResult.user || syncResult.user.role !== 'admin') {
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
      return { ok: false, error: msg, errorCode: err?.code };
    }
  };

  const resetPassword = async (email: string): Promise<AuthActionResult> => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { ok: true };
    } catch (err: any) {
      const msg = formatFirebaseAuthError(err?.code, err?.message);
      return { ok: false, error: msg, errorCode: err?.code };
    }
  };

  const signInWithGoogle = async (): Promise<AuthActionResult> => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const syncResult = await syncProfile(result.user);
      if (syncResult.error) {
        await firebaseSignOut(auth);
        setProfile(null);
        setAuthError(syncResult.error);
        return { ok: false, error: syncResult.error };
      }
      if (!syncResult.user || syncResult.user.role !== 'admin') {
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
      return { ok: false, error: msg, errorCode: err?.code };
    }
  };

  const signInWithGoogleRedirect = async (): Promise<AuthActionResult> => {
    setAuthError(null);
    try {
      await signInWithRedirect(auth, googleAuthProvider);
      return { ok: true };
    } catch (err: any) {
      const msg = formatFirebaseAuthError(err?.code, err?.message);
      setAuthError(msg);
      return { ok: false, error: msg, errorCode: err?.code };
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
        signInWithGoogleRedirect,
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
