import { ArrowRight, LoaderCircle, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Alert } from '../components/ui/Alert';
import { FormField } from '../components/ui/FormField';
import { getErrorMessage } from '../api/config';
import { useAuthStore } from '../store/useAuthStore';
import type { RequestStatus, SignupPayload } from '../types';

interface SignupForm extends SignupPayload {
  confirmPassword: string;
}

type SignupErrors = Partial<Record<keyof SignupForm, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_.]+$/;
const MIN_PASSWORD = 8;
const REDIRECT_DELAY_MS = 1500;

function validate(v: SignupForm): SignupErrors {
  const e: SignupErrors = {};
  const username = v.username.trim();

  if (!username) e.username = 'Username is required.';
  else if (username.length < 3) e.username = 'Username must be at least 3 characters.';
  else if (username.length > 30) e.username = 'Username must be 30 characters or fewer.';
  else if (!USERNAME_RE.test(username)) e.username = 'Use letters, numbers, underscores or dots only.';

  if (!v.email.trim()) e.email = 'Email is required.';
  else if (!EMAIL_RE.test(v.email.trim())) e.email = 'Enter a valid email address.';

  if (!v.password) e.password = 'Password is required.';
  else if (v.password.length < MIN_PASSWORD) e.password = `Password must be at least ${MIN_PASSWORD} characters.`;

  if (!v.confirmPassword) e.confirmPassword = 'Please confirm your password.';
  else if (v.password !== v.confirmPassword) e.confirmPassword = 'Passwords do not match.';

  return e;
}

/** 0–4 heuristic score used for the strength meter. */
function passwordScore(pw: string): number {
  let score = 0;
  if (pw.length >= MIN_PASSWORD) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 14) score++;
  return score;
}

const STRENGTH = [
  { label: 'Too weak', color: 'bg-red-500' },
  { label: 'Weak', color: 'bg-orange-500' },
  { label: 'Fair', color: 'bg-yellow-400' },
  { label: 'Good', color: 'bg-neon-400' },
  { label: 'Strong', color: 'bg-neon shadow-glow-xs' },
] as const;

export default function Signup() {
  const navigate = useNavigate();
  const signup = useAuthStore((s) => s.signup);

  const [values, setValues] = useState<SignupForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState<SignupErrors>({});
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isBusy = status === 'loading' || status === 'success';
  const score = useMemo(() => passwordScore(values.password), [values.password]);
  const strength = STRENGTH[score] ?? STRENGTH[0];

  // Redirect to /login shortly after a successful sign-up.
  useEffect(() => {
    if (status !== 'success') return;
    const t = window.setTimeout(() => {
      navigate('/login', {
        replace: true,
        state: {
          registeredEmail: values.email.trim().toLowerCase(),
          message: 'Account created! Log in to start listening.',
        },
      });
    }, REDIRECT_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [status, navigate, values.email]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const key = name as keyof SignupForm;
    const next = { ...values, [key]: value };
    setValues(next);
    if (serverError) setServerError(null);

    // Live-revalidate a field once it has shown an error.
    if (fieldErrors[key]) setFieldErrors((errs) => ({ ...errs, [key]: validate(next)[key] }));
    if (key === 'password' && fieldErrors.confirmPassword && next.confirmPassword) {
      setFieldErrors((errs) => ({ ...errs, confirmPassword: validate(next).confirmPassword }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = validate(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setStatus('loading');
    setServerError(null);
    try {
      const res = await signup({
        username: values.username.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
      setSuccessMessage(res?.message ?? 'Account created successfully! Redirecting to log in…');
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Sign up and bring your library to life."
      footer={
        <>
          Already have an account?{' '}
          <Link
            id="signup-to-login-link"
            to="/login"
            className="font-semibold text-neon transition hover:text-neon-300 hover:text-glow"
          >
            Log in
          </Link>
        </>
      }
    >
      <form id="signup-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        {serverError && <Alert variant="error">{serverError}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}

        <FormField
          id="signup-username"
          name="username"
          label="Username"
          icon={User}
          placeholder="neonlistener"
          autoComplete="username"
          autoFocus
          value={values.username}
          onChange={handleChange}
          error={fieldErrors.username}
          disabled={isBusy}
        />
        <FormField
          id="signup-email"
          name="email"
          type="email"
          label="Email"
          icon={Mail}
          placeholder="you@example.com"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          error={fieldErrors.email}
          disabled={isBusy}
        />
        <div className="space-y-2">
          <FormField
            id="signup-password"
            name="password"
            type="password"
            label="Password"
            icon={Lock}
            placeholder={`At least ${MIN_PASSWORD} characters`}
            autoComplete="new-password"
            value={values.password}
            onChange={handleChange}
            error={fieldErrors.password}
            disabled={isBusy}
          />
          {values.password && (
            <div className="flex animate-fade-in items-center gap-3" aria-live="polite">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                      i < score ? strength.color : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
              <span className="w-16 text-right text-[11px] font-medium text-white/50">{strength.label}</span>
            </div>
          )}
        </div>
        <FormField
          id="signup-confirm-password"
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          icon={ShieldCheck}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={handleChange}
          error={fieldErrors.confirmPassword}
          disabled={isBusy}
        />

        <button id="signup-submit" type="submit" disabled={isBusy} className="btn-neon group mt-2 w-full">
          {status === 'loading' ? (
            <>
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Creating account…
            </>
          ) : status === 'success' ? (
            <>
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Redirecting…
            </>
          ) : (
            <>
              Sign Up
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>

        <p className="pt-1 text-center text-[11px] leading-relaxed text-white/35">
          By signing up you agree to the Terms of Service and Privacy Policy.
        </p>
      </form>
    </AuthLayout>
  );
}
