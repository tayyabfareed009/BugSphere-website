import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { FiUserPlus } from 'react-icons/fi'
import Button from '../../components/Buttons/Button.jsx'
import FormInput from '../../components/Forms/FormInput.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { AuthFrame } from '../Login/Login.jsx'

export default function Register() {
  const { register: createAccount } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (values) => {
    await createAccount(values)
    navigate('/dashboard')
  }

  return (
    <AuthFrame title="Create your workspace" subtitle="Invite testers, assign developers, and centralize defect triage.">
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        <FormInput label="Full name" {...register('name', { required: 'Name is required' })} error={errors.name?.message} />
        <FormInput label="Email" type="email" {...register('email', { required: 'Email is required' })} error={errors.email?.message} />
        <label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
          Role
          <select {...register('role')} className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
            <option>Admin</option>
            <option>Developer</option>
            <option>Tester</option>
          </select>
        </label>
        <FormInput label="Password" type="password" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Use at least 8 characters' } })} error={errors.password?.message} />
        <Button icon={FiUserPlus} className="w-full">Register</Button>
      </form>
    </AuthFrame>
  )
}
