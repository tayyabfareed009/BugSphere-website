import { useEffect, useState } from 'react'
import { FiUserPlus } from 'react-icons/fi'
import Button from '../../components/Buttons/Button.jsx'
import api from '../../services/api.js'
import { PageHeader } from '../Projects/Projects.jsx'

export default function Users() {
  const [users, setUsers] = useState([])
  useEffect(() => { api.get('/users').then(({ data }) => { console.log('[BugSphere] Users loaded'); setUsers(data) }).catch((error) => console.error('[BugSphere] Users load failed', error)) }, [])
  return <div className="grid gap-6"><PageHeader title="Users" text="Organization members and their workspace roles." action={<Button icon={FiUserPlus}>Invite user</Button>} /><div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"><table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-950"><tr>{['User', 'Email', 'Role', 'Notifications'].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{users.map((user) => <tr key={user._id}><td className="px-4 py-4 font-bold">{user.name}</td><td className="px-4 py-4 text-slate-500">{user.email}</td><td className="px-4 py-4">{user.role}</td><td className="px-4 py-4">{user.notificationsEnabled ? 'Enabled' : 'Disabled'}</td></tr>)}</tbody></table>{!users.length ? <p className="p-10 text-center text-slate-500">No organization members found.</p> : null}</div></div>
}
