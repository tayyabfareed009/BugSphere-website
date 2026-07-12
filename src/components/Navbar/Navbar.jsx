import { FiBell, FiLogOut, FiMenu, FiMoon, FiPlus, FiSun } from 'react-icons/fi'
import Button from '../Buttons/Button.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { useTheme } from '../../hooks/useTheme.js'

export default function Navbar({ onMenu }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden" aria-label="Open sidebar">
          <FiMenu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Workspace</p>
          <h1 className="text-lg font-bold text-slate-950 dark:text-white">Engineering Command Center</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button to="/bugs/new" icon={FiPlus} className="hidden sm:inline-flex">New Bug</Button>
        <button onClick={toggleTheme} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Toggle theme">
          {theme === 'dark' ? <FiSun /> : <FiMoon />}
        </button>
        <button className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Notifications">
          <FiBell />
        </button>
        <div className="hidden items-center gap-3 pl-2 sm:flex">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">{user?.avatar || 'BS'}</div>
          <div className="hidden text-sm md:block">
            <p className="font-semibold text-slate-950 dark:text-white">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.role}</p>
          </div>
        </div>
        <button onClick={logout} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Logout">
          <FiLogOut />
        </button>
      </div>
    </header>
  )
}
