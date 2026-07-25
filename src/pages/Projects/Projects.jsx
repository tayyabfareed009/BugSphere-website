import { useEffect, useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import Button from '../../components/Buttons/Button.jsx'
import SearchBar from '../../components/SearchBar/SearchBar.jsx'
import api from '../../services/api.js'

export default function Projects() {
  const [query, setQuery] = useState(''); const [projects, setProjects] = useState([]); const [loading, setLoading] = useState(true)
  useEffect(() => { api.get('/projects', { params: { search: query || undefined } }).then(({ data }) => { console.log('[BugSphere] Projects loaded'); setProjects(data) }).catch((error) => console.error('[BugSphere] Projects load failed', error)).finally(() => setLoading(false)) }, [query])

  return (
    <div className="grid gap-6">
      <PageHeader title="Projects" text="Create, edit, search, filter, and monitor product workspaces." action={<Button icon={FiPlus}>Create Project</Button>} />
      <SearchBar value={query} onChange={setQuery} placeholder="Search projects by name or key" />
      <div className="grid gap-5 lg:grid-cols-3">
        {projects.map((project) => (
          <article key={project._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">{project.key}</span>
                <h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">{project.name}</h3>
                <p className="mt-1 text-sm text-slate-500">Owner: {project.owner?.name || '—'}</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-sm"><span>Project status</span><span>{project.status}</span></div>
              <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-2 w-2/3 rounded-full bg-sky-500" /></div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm">
              <Metric label="Members" value={project.members?.length || 0} />
              <Metric label="Status" value={project.status} />
              <Metric label="Due" value={project.dueDate ? new Date(project.dueDate).toLocaleDateString() : '—'} />
            </div>
          </article>
        ))}
      </div>{!loading && !projects.length ? <p className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">No projects yet. Create your first project to begin.</p> : null}
    </div>
  )
}

export function PageHeader({ title, text, action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-3xl font-black text-slate-950 dark:text-white">{title}</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">{text}</p>
      </div>
      {action}
    </div>
  )
}

function Metric({ label, value }) {
  return <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950"><p className="font-black text-slate-950 dark:text-white">{value}</p><p className="text-xs text-slate-500">{label}</p></div>
}
