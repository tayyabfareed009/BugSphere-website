import { FiAlertTriangle, FiCheckCircle, FiFolder, FiShield } from 'react-icons/fi'
import Button from '../../components/Buttons/Button.jsx'
import StatCard from '../../components/Cards/StatCard.jsx'
import AnalyticsCharts from '../../components/Charts/AnalyticsCharts.jsx'
import BugTable from '../../components/Tables/BugTable.jsx'
import { bugs, dashboardStats, projects } from '../../utils/mockData.js'

const icons = [FiShield, FiAlertTriangle, FiCheckCircle, FiFolder]

export default function Dashboard() {
  return (
    <div className="grid gap-6">
      <section className="rounded-lg bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold text-sky-200">Dashboard</p>
            <h2 className="mt-2 text-3xl font-black">Track. Manage. Resolve.</h2>
            <p className="mt-3 max-w-2xl text-slate-300">Monitor critical bugs, project velocity, developer workload, recent activity, and reporting trends from one command center.</p>
          </div>
          <div className="flex gap-3">
            <Button to="/bugs/new" variant="secondary">Create Bug</Button>
            <Button to="/reports" variant="secondary">View Reports</Button>
          </div>
        </div>
      </section>
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat, index) => <StatCard key={stat.label} {...stat} icon={icons[index]} />)}
      </section>
      <AnalyticsCharts />
      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-950 dark:text-white">Recent Bugs</h3>
            <Button to="/bugs" variant="ghost">View all</Button>
          </div>
          <BugTable bugs={bugs} />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xl font-black text-slate-950 dark:text-white">Quick Actions</h3>
          <div className="mt-5 grid gap-3">
            <Button to="/projects" variant="secondary">Manage projects</Button>
            <Button to="/users" variant="secondary">Invite developers</Button>
            <Button to="/bugs" variant="secondary">Export bug list CSV</Button>
          </div>
          <h4 className="mt-8 font-bold">Recent Activity</h4>
          <div className="mt-4 space-y-4">
            {projects.map((project) => <p key={project.id} className="text-sm text-slate-500"><span className="font-semibold text-slate-900 dark:text-white">{project.name}</span> has {project.bugs} active bugs.</p>)}
          </div>
        </div>
      </section>
    </div>
  )
}
