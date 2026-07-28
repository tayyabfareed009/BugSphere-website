import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Button from '../../components/Buttons/Button.jsx'
import FormInput from '../../components/Forms/FormInput.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import api from '../../services/api.js'
import { PageHeader } from '../Projects/Projects.jsx'

export default function Profile() {
  const { user } = useAuth(); const { register, handleSubmit } = useForm({ defaultValues: user })
  const save = async (values) => { try { console.log('[WorkSphere] Saving profile'); await api.put('/users/profile', { name: values.name, notificationsEnabled: values.notificationsEnabled }); toast.success('Profile saved') } catch (error) { console.error('[WorkSphere] Profile save failed', error); toast.error('Could not save profile') } }
  return <div className="grid gap-6"><PageHeader title="Profile" text="Update your workspace identity and notification preference." /><form onSubmit={handleSubmit(save)} className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[180px_1fr]"><div className="text-center"><div className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-700 text-3xl font-black text-white shadow-lg shadow-indigo-500/20">{user?.name?.slice(0, 1).toUpperCase()}</div><p className="mt-4 text-sm text-slate-500">Avatar upload is managed through your organization’s secure Cloudinary configuration.</p></div><div className="grid gap-4"><FormInput label="Name" {...register('name')} /><FormInput label="Email" value={user?.email || ''} disabled readOnly /><FormInput label="Role" value={user?.role || ''} disabled readOnly /><label className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-sm font-medium dark:border-slate-800">In-app notifications<input type="checkbox" {...register('notificationsEnabled')} /></label><Button className="justify-self-start">Save profile</Button></div></form></div>
}
