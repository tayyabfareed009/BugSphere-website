import { FiDownload } from 'react-icons/fi'
import Button from '../../components/Buttons/Button.jsx'
import AnalyticsCharts from '../../components/Charts/AnalyticsCharts.jsx'
import { priorityChart, projects, statusChart, users } from '../../utils/mockData.js'
import { PageHeader } from '../Projects/Projects.jsx'

export default function Reports() {
  return (
    <div className="grid gap-6">
      <PageHeader title="Reports" text="Analytics for status, priority, severity, projects, monthly volume, and developer performance." action={<Button icon={FiDownload}>Export PDF</Button>} />
      <AnalyticsCharts />
      <div className="grid gap-5 lg:grid-cols-3">
        <ReportList title="Bugs per Project" items={projects.map((project) => [project.name, project.bugs])} />
        <ReportList title="Bugs by Status" items={statusChart.map((item) => [item.name, item.value])} />
        <ReportList title="Bugs by Priority" items={priorityChart.map((item) => [item.name, item.value])} />
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-xl font-black text-slate-950 dark:text-white">Developer Performance</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {users.filter((user) => user.role !== 'Tester').map((user, index) => (
            <div key={user.id} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
              <p className="font-bold">{user.name}</p>
              <p className="mt-1 text-sm text-slate-500">{18 - index * 4} resolved bugs this sprint</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ReportList({ title, items }) {
  const max = Math.max(...items.map((item) => item[1]))
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="font-black text-slate-950 dark:text-white">{title}</h3>
      <div className="mt-5 grid gap-4">
        {items.map(([label, value]) => <div key={label}><div className="flex justify-between text-sm"><span>{label}</span><span className="font-bold">{value}</span></div><div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-2 rounded-full bg-sky-500" style={{ width: `${(value / max) * 100}%` }} /></div></div>)}
      </div>
    </div>
  )
}
