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
        <FormInput label="Organization name" {...register('organizationName', { required: 'Organization name is required' })} error={errors.organizationName?.message} />
        <FormInput label="Password" type="password" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Use at least 8 characters' } })} error={errors.password?.message} />
        <Button icon={FiUserPlus} className="w-full">Register</Button>
      </form>
    </AuthFrame>
  )
}
