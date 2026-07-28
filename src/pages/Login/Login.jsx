import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiLogIn, FiArrowLeft, FiMail } from 'react-icons/fi';
import Button from '../../components/Buttons/Button.jsx';
import FormInput from '../../components/Forms/FormInput.jsx';
import { useAuth } from '../../hooks/useAuth.js';

export default function Login() {
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Login form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { organizationName: '', email: '', password: '' },
  });

  // Reset password state
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // ── Login submit ──
  const onLogin = async (values) => {
    try {
      await login(values);
      const redirectPath = location.state?.from?.pathname || '/dashboard';
      navigate(redirectPath);
    } catch (error) {
      // Error is already handled by AuthProvider with toast
    }
  };

  // ── Reset password submit ──
  const onReset = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    setIsResetting(true);
    try {
      await resetPassword(resetEmail);
      // Success – toast already shown
      setIsResetMode(false);
      setResetEmail('');
    } catch (error) {
      // Error is already handled by AuthProvider with toast
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AuthFrame
      title={isResetMode ? 'Reset password' : 'Welcome back'}
      subtitle={
        isResetMode
          ? 'Enter your email address and we\'ll send you a link to reset your password.'
          : 'Sign in to continue tracking releases, defects, and engineering health.'
      }
    >
      {isResetMode ? (
        // ── Reset password form ──
        <form onSubmit={onReset} className="grid gap-4">
          <FormInput
            label="Email"
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            required
            icon={FiMail}
            placeholder="your@email.com"
          />
          <Button type="submit" disabled={isResetting} className="w-full">
            {isResetting ? 'Sending…' : 'Send reset link'}
          </Button>
          <button
            type="button"
            onClick={() => {
              setIsResetMode(false);
              setResetEmail('');
            }}
            className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <FiArrowLeft size={16} /> Back to login
          </button>
        </form>
      ) : (
        // ── Login form ──
        <form onSubmit={handleSubmit(onLogin)} className="grid gap-4">
          <FormInput
            label="Organization"
            type="text"
            {...register('organizationName', {
              required: 'Organization name is required',
            })}
            error={errors.organization?.message}
          />
          <FormInput
            label="Email"
            type="email"
            {...register('email', {
              required: 'Email is required',
            })}
            error={errors.email?.message}
          />
          <FormInput
            label="Password"
            type="password"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Use at least 8 characters',
              },
            })}
            error={errors.password?.message}
          />
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <input type="checkbox" defaultChecked /> Remember me
            </label>
            <button
              type="button"
              onClick={() => setIsResetMode(true)}
              className="font-semibold text-sky-600 hover:underline"
            >
              Reset password
            </button>
          </div>
          <Button icon={FiLogIn} className="w-full">
            Login
          </Button>
          <p className="text-center text-sm text-slate-500">
            New to WorkSphere?{' '}
            <Link to="/register" className="font-semibold text-sky-600">
              Create account
            </Link>
          </p>
        </form>
      )}
    </AuthFrame>
  );
}

// ── AuthFrame (unchanged) ──
export function AuthFrame({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <Link to="/" className="mb-8 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 font-black text-white dark:bg-white dark:text-slate-950">
            WS
          </span>
          <span>
            <span className="block text-lg font-black text-slate-950 dark:text-white">
              WorkSphere
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Track. Manage. Resolve.
            </span>
          </span>
        </Link>
        <h1 className="text-3xl font-black text-slate-950 dark:text-white">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}