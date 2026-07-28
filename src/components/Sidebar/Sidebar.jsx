import { NavLink } from 'react-router-dom'
import { FiBarChart2, FiCalendar, FiColumns, FiClipboard, FiFileText, FiFolder, FiGrid, FiSettings, FiShield, FiUser, FiUsers } from 'react-icons/fi'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/projects', label: 'Projects', icon: FiFolder },
  { to: '/teams', label: 'Teams', icon: FiUsers },
  { to: '/requirements', label: 'Requirements', icon: FiFileText },
  { to: '/tasks', label: 'Tasks', icon: FiClipboard },
  { to: '/kanban', label: 'Kanban', icon: FiColumns },
  { to: '/calendar', label: 'Calendar', icon: FiCalendar },
  { to: '/submissions', label: 'Daily work', icon: FiClipboard },
  { to: '/bugs', label: 'Bugs', icon: FiShield },
  { to: '/reports', label: 'Reports', icon: FiBarChart2 },
  { to: '/users', label: 'Users', icon: FiUsers },
  { to: '/profile', label: 'Profile', icon: FiUser },
  { to: '/settings', label: 'Settings', icon: FiSettings }
]

export default function Sidebar({ open, onClose }) {
  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-950 lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6 dark:border-slate-800">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">BS</div>
        <div>
          <p className="text-base font-black text-slate-950 dark:text-white">BugSphere</p>
          <p className="text-xs font-medium text-slate-500">Track. Manage. Resolve.</p>
        </div>
      </div>
      <nav className="space-y-1 p-4">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) => `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${isActive ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
