import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Button from '../../components/Buttons/Button.jsx'
import { PageHeader } from '../Projects/Projects.jsx'
import api from '../../services/api.js'

const configs = {
  tasks: { title: 'Tasks', text: 'Plan, assign, and track delivery work.', endpoint: '/tasks', fields: ['title', 'description', 'project', 'assignee', 'deadline', 'estimatedHours'], canCreate: true },
  requirements: { title: 'Requirements', text: 'Capture, review, and approve product requirements.', endpoint: '/requirements', fields: ['title', 'content', 'project'], canCreate: true },
  submissions: { title: 'Daily submissions', text: 'Submit work updates and review delivery evidence.', endpoint: '/submissions', fields: ['task', 'description', 'hoursWorked', 'links'], canCreate: true }
}

export default function WorkItems({ type }) {
  const config = configs[type]; const [items, setItems] = useState([]); const [show, setShow] = useState(false); const [form, setForm] = useState({})
  const load = useCallback(() => api.get(config.endpoint).then(({ data }) => setItems(data)).catch(() => toast.error(`Could not load ${config.title.toLowerCase()}`)), [config.endpoint, config.title])
  useEffect(() => { load() }, [load])
  const submit = async (event) => { event.preventDefault(); try { await api.post(config.endpoint, { ...form, estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : undefined, hoursWorked: form.hoursWorked ? Number(form.hoursWorked) : undefined, links: form.links ? form.links.split(',').map((link) => link.trim()).filter(Boolean) : [] }); toast.success(`${config.title.slice(0, -1)} created`); setForm({}); setShow(false); load() } catch (error) { toast.error(error.response?.data?.message || 'Unable to save') } }
  return <div className="grid gap-6">
    <PageHeader title={config.title} text={config.text} action={<Button onClick={() => setShow(true)}>Create {config.title.slice(0, -1)}</Button>} />
    {show && <form onSubmit={submit} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2">
      {config.fields.map((field) => <label key={field} className={`grid gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200 ${field === 'description' || field === 'content' ? 'md:col-span-2' : ''}`}>{label(field)}
        {field === 'description' || field === 'content' ? <textarea required={field !== 'description'} value={form[field] || ''} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className="min-h-24 rounded-lg border border-slate-300 bg-transparent p-2 dark:border-slate-700" /> : <input required={['title', 'project', 'task', 'hoursWorked'].includes(field)} type={field === 'deadline' ? 'date' : field.includes('Hours') || field === 'hoursWorked' ? 'number' : 'text'} value={form[field] || ''} onChange={(e) => setForm({ ...form, [field]: e.target.value })} placeholder={field.endsWith('project') || field === 'task' || field === 'assignee' ? 'MongoDB ID' : ''} className="rounded-lg border border-slate-300 bg-transparent p-2 dark:border-slate-700" />}
      </label>)}
      <div className="flex gap-3 md:col-span-2"><Button type="submit">Save</Button><Button type="button" variant="secondary" onClick={() => setShow(false)}>Cancel</Button></div>
    </form>}
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-500 dark:bg-slate-950"><tr><th className="p-4">Title</th><th className="p-4">Project / Task</th><th className="p-4">Status</th><th className="p-4">Updated</th></tr></thead><tbody>{items.map((item) => <tr key={item._id} className="border-t border-slate-100 dark:border-slate-800"><td className="p-4 font-semibold text-slate-900 dark:text-white">{item.title || item.description}</td><td className="p-4">{item.project?.name || item.task?.title || '—'}</td><td className="p-4"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">{item.status}</span></td><td className="p-4">{new Date(item.updatedAt || item.submissionDate).toLocaleDateString()}</td></tr>)}</tbody></table>{!items.length && <p className="p-10 text-center text-slate-500">No {config.title.toLowerCase()} yet.</p>}</div>
  </div>
}
function label(value) { return value.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase()) }
