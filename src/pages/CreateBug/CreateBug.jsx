import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Buttons/Button.jsx'
import FormInput from '../../components/Forms/FormInput.jsx'
import { PRIORITIES, SEVERITIES, STATUSES } from '../../utils/constants.js'
import api from '../../services/api.js'
import { PageHeader } from '../Projects/Projects.jsx'

export default function CreateBug() {
  const navigate = useNavigate()
  const [options, setOptions] = useState({ projects: [], users: [] })
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { status: 'Open', priority: 'Medium', severity: 'Minor' } })
  useEffect(() => { Promise.all([api.get('/projects'), api.get('/users')]).then(([projects, users]) => setOptions({ projects: projects.data, users: users.data })).catch((error) => console.error('[BugSphere] Bug form options failed', error)) }, [])
  const onSubmit = async (values) => {
    try {
      const form = new FormData()
      Object.entries(values).forEach(([key, value]) => { if (key !== 'screenshot' && value) form.append(key, value) })
      if (values.screenshot?.[0]) form.append('screenshot', values.screenshot[0])
      console.log('[BugSphere] Creating bug')
      const { data } = await api.post('/bugs', form)
      toast.success('Bug created')
      navigate(`/bugs/${data._id}`)
    } catch (error) { console.error('[BugSphere] Bug creation failed', error); toast.error(error.response?.data?.message || 'Could not create bug') }
  }
  return <BugForm title="Create Bug" text="Capture reproducible details, ownership, severity, screenshots, and workflow state." onSubmit={handleSubmit(onSubmit)} register={register} errors={errors} options={options} />
}

export function BugForm({ title, text, onSubmit, register, errors, options = { projects: [], users: [] } }) {
  return <div className="grid gap-6"><PageHeader title={title} text={text} />
    <form onSubmit={onSubmit} className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-5 lg:grid-cols-2">
        <FormInput label="Title" {...register('title', { required: 'Title is required' })} error={errors.title?.message} />
        <Select label="Project" register={register('project', { required: true })} options={options.projects.map((p) => ({ value: p._id, label: `${p.key} · ${p.name}` }))} />
        <Select label="Priority" register={register('priority')} options={PRIORITIES.map((x) => ({ value: x, label: x }))} />
        <Select label="Severity" register={register('severity')} options={SEVERITIES.map((x) => ({ value: x, label: x }))} />
        <Select label="Status" register={register('status')} options={STATUSES.map((x) => ({ value: x, label: x }))} />
        <Select label="Assignee" register={register('assignedDeveloper')} options={[{ value: '', label: 'Unassigned' }, ...options.users.map((u) => ({ value: u._id, label: `${u.name} (${u.role})` }))]} />
      </div>
      <FormInput as="textarea" rows={6} label="Description" {...register('description', { required: 'Description is required' })} error={errors.description?.message} />
      <FormInput label="Upload evidence" type="file" accept="image/*,.txt,.json,.pdf,.zip" {...register('screenshot')} />
      <div className="flex justify-end"><Button>Save bug</Button></div>
    </form></div>
}

function Select({ label, options, register }) { return <label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">{label}<select {...register} className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">{options.length ? options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>) : <option value="">No options available</option>}</select></label> }
