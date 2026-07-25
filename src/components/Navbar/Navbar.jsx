import { useEffect, useState } from 'react'
import { FiBell, FiLogOut, FiMenu, FiMoon, FiPlus, FiSun } from 'react-icons/fi'
import Button from '../Buttons/Button.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { useTheme } from '../../hooks/useTheme.js'
import api from '../../services/api.js'

export default function Navbar({ onMenu }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  useEffect(() => { const load = () => api.get('/notifications').then(({ data }) => setNotifications(data)).catch((error) => console.error('[BugSphere] Notifications load failed', error)); load(); const interval = setInterval(load, 30000); return () => clearInterval(interval) }, [])
  const unread = notifications.filter((item) => !item.read).length
  const markRead = async (id) => { try { await api.put(`/notifications/${id}/read`); setNotifications((items) => items.map((item) => item._id === id ? { ...item, read: true } : item)) } catch (error) { console.error('[BugSphere] Notification update failed', error) } }

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
        <div className="relative"><button onClick={() => setOpen((value) => !value)} className="relative rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Notifications" aria-expanded={open}>
          <FiBell />
          {unread ? <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unread}</span> : null}
        </button>{open ? <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800"><b>Notifications</b><span className="text-xs text-slate-500">{unread} unread</span></div><div className="max-h-80 overflow-auto">{notifications.length ? notifications.map((item) => <button key={item._id} onClick={() => markRead(item._id)} className={`block w-full border-b border-slate-100 p-4 text-left text-sm hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 ${item.read ? 'opacity-60' : ''}`}><b>{item.title}</b><p className="mt-1 text-slate-500">{item.message}</p></button>) : <p className="p-6 text-center text-sm text-slate-500">You’re all caught up.</p>}</div></div> : null}</div>
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
