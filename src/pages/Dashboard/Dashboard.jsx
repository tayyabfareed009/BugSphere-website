import { useEffect, useState } from 'react'
import { FiAlertTriangle, FiCheckCircle, FiFolder, FiShield } from 'react-icons/fi'
import Button from '../../components/Buttons/Button.jsx'
import StatCard from '../../components/Cards/StatCard.jsx'
import BugTable from '../../components/Tables/BugTable.jsx'
import api from '../../services/api.js'

const icons = [FiShield, FiAlertTriangle, FiCheckCircle, FiFolder]
export default function Dashboard() {
  const [data, setData] = useState(null)
  useEffect(() => { api.get('/dashboard').then(({ data: payload }) => { console.log('[BugSphere] Dashboard loaded'); setData(payload) }).catch((error) => console.error('[BugSphere] Dashboard load failed', error)) }, [])
  if (!data) return <p className="py-10 text-center text-slate-500">Loading your workspace…</p>
  const stats = [{ label: 'Total bugs', value: data.total, trend: 'All workspace issues' }, { label: 'Open work', value: data.open, trend: 'Needs attention' }, { label: 'Resolved', value: data.resolved, trend: 'Resolved issues' }, { label: 'Projects', value: data.projects, trend: `${data.developers} developers` }]
  return <div className="grid gap-6"><section className="rounded-lg bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 p-6 text-white shadow-sm"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-sm font-bold text-sky-200">Workspace overview</p><h2 className="mt-2 text-3xl font-black">Track. Manage. Resolve.</h2><p className="mt-3 max-w-2xl text-slate-300">Live organization metrics scoped to your role and tenant.</p></div><div className="flex gap-3"><Button to="/bugs/new" variant="secondary">Create bug</Button><Button to="/reports" variant="secondary">View reports</Button></div></div></section><section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat, index) => <StatCard key={stat.label} {...stat} icon={icons[index]} />)}</section><section><div className="mb-4 flex items-center justify-between"><h3 className="text-xl font-black">Recent bugs</h3><Button to="/bugs" variant="ghost">View all</Button></div>{data.recentBugs?.length ? <BugTable bugs={data.recentBugs} /> : <p className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">No bugs have been reported in this organization.</p>}</section></div>
}
