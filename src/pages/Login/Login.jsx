import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';
import Button from '../../components/Buttons/Button.jsx';
import FormInput from '../../components/Forms/FormInput.jsx';
import { useAuth } from '../../hooks/useAuth.js';

export default function Login() {
  console.log('🔐 Login component mounted');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  console.log('📍 Current location:', location);

  const defaultValues = { organizationName: '', email: '', password: '' };
  console.log('📋 Default form values:', defaultValues);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  console.log('📝 Form registered');

  const onSubmit = async (values) => {
    console.log('🚀 Form submitted with values:', values);

    console.log('🏢 Organization:', values.organization);
    console.log('📧 Email:', values.email);
    console.log('🔑 Password (length):', values.password.length);

    try {
      console.log('⏳ Calling login API...');
      const result = await login(values);
      console.log('✅ Login API resolved. Result:', result);

      const redirectPath = location.state?.from?.pathname || '/dashboard';
      console.log(`🧭 Redirecting to: ${redirectPath}`);
      navigate(redirectPath);
      console.log('🔄 Navigation triggered');
    } catch (error) {
      console.error('❌ Login API rejected with error:', error);
      // Optionally set error state here (not shown)
    }
  };

  console.log('📊 Current form errors:', errors);

  return (
    <AuthFrame
      title="Welcome back"
      subtitle="Sign in to continue tracking releases, defects, and engineering health."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
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
          <span className="font-semibold text-sky-600">Reset through Firebase Console</span>
        </div>
        <Button icon={FiLogIn} className="w-full">
          Login
        </Button>
        <p className="text-center text-sm text-slate-500">
          New to BugSphere?{' '}
          <Link to="/register" className="font-semibold text-sky-600">
            Create account
          </Link>
        </p>
      </form>
    </AuthFrame>
  );
}

// AuthFrame remains unchanged
export function AuthFrame({ title, subtitle, children }) {
  console.log('🖼️ AuthFrame rendered with title:', title);

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <Link to="/" className="mb-8 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 font-black text-white dark:bg-white dark:text-slate-950">
            BS
          </span>
          <span>
            <span className="block text-lg font-black text-slate-950 dark:text-white">
              BugSphere
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