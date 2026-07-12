import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Buttons/Button.jsx'
import FormInput from '../../components/Forms/FormInput.jsx'
import { PRIORITIES, SEVERITIES, STATUSES } from '../../utils/constants.js'
import { projects, users } from '../../utils/mockData.js'
import { PageHeader } from '../Projects/Projects.jsx'

export default function CreateBug() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { status: 'Open', priority: 'Medium', severity: 'Minor' } })

  const onSubmit = () => {
    toast.success('Bug created')
    navigate('/bugs')
  }

  return <BugForm title="Create Bug" text="Capture reproducible details, ownership, severity, screenshots, and workflow state." onSubmit={handleSubmit(onSubmit)} register={register} errors={errors} />
}

export function BugForm({ title, text, onSubmit, register, errors }) {
  return (
    <div className="grid gap-6">
      <PageHeader title={title} text={text} />
      <form onSubmit={onSubmit} className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-5 lg:grid-cols-2">
          <FormInput label="Title" {...register('title', { required: 'Title is required' })} error={errors.title?.message} />
          <label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
            Project
            <select {...register('project')} className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
              {projects.map((project) => <option key={project.id}>{project.name}</option>)}
            </select>
          </label>
          <Select label="Priority" options={PRIORITIES} register={register('priority')} />
          <Select label="Severity" options={SEVERITIES} register={register('severity')} />
          <Select label="Status" options={STATUSES} register={register('status')} />
          <label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
            Assigned Developer
            <select {...register('assignee')} className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
              {users.filter((user) => user.role !== 'Tester').map((user) => <option key={user.id}>{user.name}</option>)}
            </select>
          </label>
        </div>
        <FormInput as="textarea" rows={6} label="Description" {...register('description', { required: 'Description is required' })} error={errors.description?.message} />
        <FormInput label="Upload Screenshot" type="file" accept="image/*" {...register('screenshot')} />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary">Save Draft</Button>
          <Button>Submit Bug</Button>
        </div>
      </form>
    </div>
  )
}

function Select({ label, options, register }) {
  return (
    <label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}
      <select {...register} className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  )
}
