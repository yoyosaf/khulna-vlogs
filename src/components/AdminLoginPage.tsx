import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND_LOGO_URL } from '../i18n/translations';
import { SeoHead } from './SeoHead';

interface AdminLoginPageProps {
  onSuccessRedirect: () => void;
  onBackPublic: () => void;
}

export function AdminLoginPage({
  onSuccessRedirect,
  onBackPublic,
}: AdminLoginPageProps) {
  const { signInWithEmail, signInWithGoogle, resetPassword, authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setResetSent(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setValidationError('Please enter a valid administrator email address.');
      return;
    }
    if (!password || password.length < 6) {
      setValidationError('Please enter your password (minimum 6 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await signInWithEmail(trimmedEmail, password, rememberMe);
      if (res.ok) {
        onSuccessRedirect();
      } else if (res.error) {
        setValidationError(res.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setResetSent(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setValidationError('Enter your administrator email address to receive a reset link.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await resetPassword(trimmedEmail);
      if (res.ok) {
        setResetSent(
          `If an administrator account exists for ${trimmedEmail}, a password reset link has been sent.`
        );
      } else if (res.error) {
        setValidationError(res.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setValidationError(null);
    setResetSent(null);
    setSubmitting(true);
    try {
      const res = await signInWithGoogle();
      if (res.ok) {
        onSuccessRedirect();
      } else if (res.error) {
        setValidationError(res.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const activeError = validationError || authError;

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center px-4 py-12">
      <SeoHead
        title="Admin Login | Khulna Vlogs"
        description="Authorized administrator sign-in portal for Khulna Vlogs."
        canonicalPath="/admin/login"
      />

      <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-8 sm:p-10">
        {/* Khulna Vlogs Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <img
            src={BRAND_LOGO_URL}
            alt="Khulna Vlogs Logo"
            className="h-16 w-16 object-contain mb-4"
          />
          <h1 className="font-display text-2xl font-bold text-[#102C40]">
            {forgotMode ? 'Reset Admin Password' : 'Administrator Sign In'}
          </h1>
          <p className="text-xs text-[#102C40]/65 mt-1.5">
            Khulna Vlogs Editorial &amp; CMS Portal
          </p>
          <div className="w-12 h-0.5 bg-[#F5C542] mt-4" />
        </div>

        {activeError && (
          <div
            role="alert"
            className="mb-5 text-xs leading-relaxed text-red-800 bg-red-50 border border-red-200 rounded-lg p-3.5"
          >
            {activeError}
          </div>
        )}

        {resetSent && (
          <div
            role="status"
            className="mb-5 text-xs leading-relaxed text-[#14532D] bg-emerald-50 border border-emerald-200 rounded-lg p-3.5"
          >
            {resetSent}
          </div>
        )}

        {forgotMode ? (
          <form onSubmit={handleForgotSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="reset-email"
                className="block text-xs font-semibold text-[#102C40] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#102C40]/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@khulnavlogs.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm text-[#102C40] bg-white border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#102C40] focus:ring-2 focus:ring-[#F5C542]/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#102C40] hover:bg-[#193F5B] disabled:opacity-60 rounded-lg transition-colors"
            >
              {submitting ? 'Sending Reset Link...' : 'Send Password Reset Email'}
            </button>

            <button
              type="button"
              onClick={() => {
                setForgotMode(false);
                setValidationError(null);
              }}
              className="w-full text-xs font-medium text-[#102C40]/75 hover:text-[#102C40]"
            >
              Back to Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold text-[#102C40] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#102C40]/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter administrator email"
                  className="w-full pl-10 pr-4 py-2.5 text-sm text-[#102C40] bg-white border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#102C40] focus:ring-2 focus:ring-[#F5C542]/40"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-[#102C40] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#102C40]/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-11 py-2.5 text-sm text-[#102C40] bg-white border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#102C40] focus:ring-2 focus:ring-[#F5C542]/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#102C40]/55 hover:text-[#102C40]"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="inline-flex items-center gap-2 text-[#102C40]/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#CBD5E1] text-[#102C40] focus:ring-[#F5C542]"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setForgotMode(true);
                  setValidationError(null);
                  setResetSent(null);
                }}
                className="font-semibold text-[#102C40] hover:text-[#39A9DB] transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 text-sm font-semibold text-[#102C40] bg-[#F5C542] hover:bg-[#e7b732] disabled:opacity-60 rounded-lg transition-colors shadow-xs"
            >
              {submitting ? 'Signing In...' : 'Login to Dashboard'}
            </button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-[#E2E8F0]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2.5 text-[#102C40]/50">or</span>
              </div>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={handleGoogleLogin}
              className="w-full py-2.5 px-4 text-sm font-semibold text-[#102C40] bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] disabled:opacity-60 rounded-lg transition-colors"
            >
              Sign in with Authorized Google Account
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#102C40]/65">
          <button
            type="button"
            onClick={onBackPublic}
            className="inline-flex items-center gap-1.5 font-medium text-[#102C40] hover:text-[#39A9DB]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Website</span>
          </button>
          <span>Authorized Admins Only</span>
        </div>
      </div>
    </div>
  );
}
