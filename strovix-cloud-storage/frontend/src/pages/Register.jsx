import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import toast from 'react-hot-toast';
import AuthLayout, { AuthField, AuthPrimaryButton } from '../components/auth/AuthLayout.jsx';

export default function Register() {
  const { register, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const invitedEmail = params.get('email') || '';
  const [form, setForm] = useState({
    name: '',
    email: invitedEmail,
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to={invitedEmail ? '/shared' : '/dashboard'} replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(form);
      toast.success(invitedEmail ? 'Account created. Shared items are ready.' : 'Account created');
      navigate(invitedEmail ? '/shared' : '/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      compactOnMobile
      title="Create account"
      subtitle={
        invitedEmail
          ? 'Sign up to open the shared file or folder'
          : 'Create your account to get started'
      }
      footerLink={
        <p className="text-center text-sm text-white/85">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-white underline underline-offset-2 hover:text-white">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <AuthField
          label="Full Name"
          type="text"
          required
          autoComplete="name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Your name"
        />
        <AuthField
          label="Email Address"
          type="email"
          required
          readOnly={Boolean(invitedEmail)}
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="you@example.com"
        />
        <AuthField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          required
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          placeholder="Password123!"
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
        <p className="text-xs text-white/75">
          Password needs 8+ chars with upper, lower, number, and special character.
        </p>

        <div className="pt-1">
          <AuthPrimaryButton disabled={submitting}>
            {submitting ? 'Creating...' : 'Sign Up'}
          </AuthPrimaryButton>
          <Link
            to="/login"
            className="mt-3 flex w-full items-center justify-center rounded-xl border-2 border-white/80 bg-transparent py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
          >
            Sign in instead
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
