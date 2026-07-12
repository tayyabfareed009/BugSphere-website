import { FiBell, FiGlobe, FiMoon } from 'react-icons/fi'
import { useTheme } from '../../hooks/useTheme.js'
import { PageHeader } from '../Projects/Projects.jsx'

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  return (
    <div className="grid gap-6">
      <PageHeader title="Settings" text="Configure theme, notifications, language, and email preferences." />
      <div className="grid gap-5 lg:grid-cols-3">
        <Setting icon={FiMoon} title="Theme">
          <button onClick={toggleTheme} className="mt-4 rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-slate-950">Switch to {theme === 'dark' ? 'light' : 'dark'} mode</button>
        </Setting>
        <Setting icon={FiBell} title="Notifications">
          <label className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-950">Email alerts <input type="checkbox" defaultChecked /></label>
          <label className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-950">In-app mentions <input type="checkbox" defaultChecked /></label>
        </Setting>
        <Setting icon={FiGlobe} title="Language">
          <select className="mt-4 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
            <option>English</option>
            <option>Urdu</option>
            <option>Spanish</option>
          </select>
        </Setting>
      </div>
    </div>
  )
}

function Setting({ icon: Icon, title, children }) {
  return <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><Icon className="h-6 w-6 text-sky-600" /><h3 className="mt-4 text-xl font-black">{title}</h3>{children}</section>
}
