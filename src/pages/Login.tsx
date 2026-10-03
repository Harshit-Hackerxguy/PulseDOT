import { ArrowRight, LoaderCircle, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Alert } from '../components/ui/Alert';
import { FormField } from '../components/ui/FormField';
import { getErrorMessage } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import type { LoginPayload, RequestStatus } from '../types';

interface LoginLocationState {
  from?: string;
  registeredEmail?: string;
  message?: string;
}

type LoginErrors = Partial<Record<keyof LoginPayload, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: LoginPayload): LoginErrors {
  const errors: LoginErrors = {};
  if (!values.email.trim()) errors.email = 'Email is required.';
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Enter a valid email address.';
  if (!values.password) errors.password = 'Password is required.';
  return errors;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const locState = (location.state as LoginLocationState | null) ?? {};
  const login = useAuthStore((s) => s.login);

  const [values, setValues] = useState<LoginPayload>({
    email: locState.registeredEmail ?? '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  const isLoading = status === 'loading' || status === 'success';

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const key = name as keyof LoginPayload;
    setValues((v) => ({ ...v, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((errs) => ({ ...errs, [key]: undefined }));
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = validate(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setStatus('loading');
    setServerError(null);
    try {
      await login({ email: values.email.trim().toLowerCase(), password: values.password });
      setStatus('success');
      navigate(locState.from && locState.from !== '/login' ? locState.from : '/', { replace: true });
    } catch (err) {
      setStatus('error');
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to keep the music glowing."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link
            id="login-to-signup-link"
            to="/signup"
            className="font-semibold text-neon transition hover:text-neon-300 hover:text-glow"
          >
            Sign up for free
          </Link>
        </>
      }
    >
      <form id="login-form" onSubmit={handleSubmit} noValidate className="space-y-5">
        {locState.message && status === 'idle' && <Alert variant="success">{locState.message}</Alert>}
        {serverError && <Alert variant="error">{serverError}</Alert>}

        <FormField
          id="login-email"
          name="email"
          type="email"
          label="Email"
          icon={Mail}
          placeholder="you@example.com"
          autoComplete="email"
          autoFocus={!values.email}
          value={values.email}
          onChange={handleChange}
          error={fieldErrors.email}
          disabled={isLoading}
        />
        <FormField
          id="login-password"
          name="password"
          type="password"
          label="Password"
          icon={Lock}
          placeholder="••••••••"
          autoComplete="current-password"
          autoFocus={Boolean(values.email)}
          value={values.password}
          onChange={handleChange}
          error={fieldErrors.password}
          disabled={isLoading}
        />

        <button id="login-submit" type="submit" disabled={isLoading} className="btn-neon group mt-2 w-full">
          {isLoading ? (
            <>
              <LoaderCircle className="h-5 w-5 animate-spin" />
              {status === 'success' ? 'Signed in' : 'Logging in…'}
            </>
          ) : (
            <>
              Log In
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
