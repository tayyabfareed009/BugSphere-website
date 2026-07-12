import { Link } from 'react-router-dom'
import Pagination from '../Pagination/Pagination.jsx'

const statusStyles = {
  Open: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  Assigned: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
  'In Progress': 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
  Testing: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
  Resolved: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  Closed: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Reopened: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
}

export default function BugTable({ bugs }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
            <tr>
              {['Bug', 'Project', 'Priority', 'Severity', 'Status', 'Assignee', 'Updated'].map((heading) => (
                <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {bugs.map((bug) => (
              <tr key={bug.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-4">
                  <Link to={`/bugs/${bug.id}`} className="font-semibold text-slate-950 hover:text-sky-600 dark:text-white">{bug.id}</Link>
                  <p className="mt-1 max-w-sm truncate text-slate-500 dark:text-slate-400">{bug.title}</p>
                </td>
                <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{bug.project}</td>
                <td className="px-4 py-4 font-medium">{bug.priority}</td>
                <td className="px-4 py-4">{bug.severity}</td>
                <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[bug.status]}`}>{bug.status}</span></td>
                <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{bug.assignee}</td>
                <td className="px-4 py-4 text-slate-500">{bug.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination />
    </div>
  )
}
