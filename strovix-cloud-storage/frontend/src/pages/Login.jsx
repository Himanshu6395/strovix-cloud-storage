import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import toast from 'react-hot-toast';
import AuthLayout, { AuthField, AuthPrimaryButton } from '../components/auth/AuthLayout.jsx';

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      compactOnMobile
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      footerLink={
        <p className="text-center text-sm text-white/85">
          No account?{' '}
          <Link to="/register" className="font-semibold text-white underline underline-offset-2 hover:text-white">
            Create one
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <AuthField
          label="Email Address"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="you@example.com"
        />
        <AuthField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          required
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          placeholder="••••••••"
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-slate-500 hover:text-slate-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          }
        />

        <div className="pt-2">
          <AuthPrimaryButton disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </AuthPrimaryButton>
          <Link
            to="/register"
            className="mt-3 flex w-full items-center justify-center rounded-xl border-2 border-white/80 bg-transparent py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
          >
            Create an account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
