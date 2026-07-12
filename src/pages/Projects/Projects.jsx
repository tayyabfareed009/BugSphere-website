import { useMemo, useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi'
import Button from '../../components/Buttons/Button.jsx'
import SearchBar from '../../components/SearchBar/SearchBar.jsx'
import { projects } from '../../utils/mockData.js'

export default function Projects() {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => projects.filter((project) => project.name.toLowerCase().includes(query.toLowerCase()) || project.key.toLowerCase().includes(query.toLowerCase())), [query])

  return (
    <div className="grid gap-6">
      <PageHeader title="Projects" text="Create, edit, search, filter, and monitor product workspaces." action={<Button icon={FiPlus}>Create Project</Button>} />
      <SearchBar value={query} onChange={setQuery} placeholder="Search projects by name or key" />
      <div className="grid gap-5 lg:grid-cols-3">
        {filtered.map((project) => (
          <article key={project.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">{project.key}</span>
                <h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">{project.name}</h3>
                <p className="mt-1 text-sm text-slate-500">Owner: {project.owner}</p>
              </div>
              <div className="flex gap-1">
                <button className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Edit project"><FiEdit2 /></button>
                <button className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950" aria-label="Delete project"><FiTrash2 /></button>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-sm"><span>Progress</span><span>{project.progress}%</span></div>
              <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-2 rounded-full bg-sky-500" style={{ width: `${project.progress}%` }} /></div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm">
              <Metric label="Bugs" value={project.bugs} />
              <Metric label="Status" value={project.status} />
              <Metric label="Due" value={project.due} />
            </div>
          </article>
        ))}
      </div>
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
