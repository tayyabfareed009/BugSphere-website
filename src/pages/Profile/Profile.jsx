import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Button from '../../components/Buttons/Button.jsx'
import FormInput from '../../components/Forms/FormInput.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { PageHeader } from '../Projects/Projects.jsx'

export default function Profile() {
  const { user } = useAuth()
  const { register, handleSubmit } = useForm({ defaultValues: user })

  return (
    <div className="grid gap-6">
      <PageHeader title="Profile" text="Edit profile, upload avatar, and change password." />
      <form onSubmit={handleSubmit(() => toast.success('Profile saved'))} className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[220px_1fr]">
        <div className="text-center">
          <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-sky-100 text-3xl font-black text-sky-700">{user?.avatar}</div>
          <FormInput label="Upload Avatar" type="file" className="mt-5" />
        </div>
        <div className="grid gap-4">
          <FormInput label="Name" {...register('name')} />
          <FormInput label="Email" type="email" {...register('email')} />
          <FormInput label="Role" {...register('role')} disabled />
          <FormInput label="New Password" type="password" placeholder="Leave blank to keep current password" />
          <Button className="justify-self-start">Save Profile</Button>
        </div>
      </form>
    </div>
  )
}
