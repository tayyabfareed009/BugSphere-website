import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api.js'
import { BugForm } from '../CreateBug/CreateBug.jsx'

export default function EditBug() {
  const { id } = useParams(); const navigate = useNavigate(); const [ready, setReady] = useState(false); const [options, setOptions] = useState({ projects: [], users: [] })
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  useEffect(() => { Promise.all([api.get(`/bugs/${id}`), api.get('/projects'), api.get('/users')]).then(([bug, projects, users]) => { reset({ ...bug.data, project: bug.data.project?._id, assignedDeveloper: bug.data.assignedDeveloper?._id }); setOptions({ projects: projects.data, users: users.data }); setReady(true) }).catch((error) => console.error('[WorkSphere] Edit bug load failed', error)) }, [id, reset])
  const submit = async (values) => { try { const form = new FormData(); Object.entries(values).forEach(([key, value]) => { if (key !== 'screenshot' && value) form.append(key, value) }); if (values.screenshot?.[0]) form.append('screenshot', values.screenshot[0]); await api.put(`/bugs/${id}`, form); toast.success('Bug updated'); navigate(`/bugs/${id}`) } catch (error) { console.error('[WorkSphere] Bug update failed', error); toast.error('Could not update bug') } }
  return ready ? <BugForm title="Edit bug" text="Update assignment, workflow state, evidence, and reproduction notes." onSubmit={handleSubmit(submit)} register={register} errors={errors} options={options} /> : <p className="py-10 text-center text-slate-500">Loading bug…</p>
}
