import { FiUserPlus } from 'react-icons/fi'
import Button from '../../components/Buttons/Button.jsx'
import { users } from '../../utils/mockData.js'
import { PageHeader } from '../Projects/Projects.jsx'

export default function Users() {
  return (
    <div className="grid gap-6">
      <PageHeader title="Users" text="Manage admins, developers, testers, and role-based permissions." action={<Button icon={FiUserPlus}>Invite User</Button>} />
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-950">
            <tr>{['User', 'Email', 'Role', 'Status', 'Permissions'].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((user) => <tr key={user.id}><td className="px-4 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-sky-100 font-bold text-sky-700">{user.avatar}</span><span className="font-bold">{user.name}</span></div></td><td className="px-4 py-4 text-slate-500">{user.email}</td><td className="px-4 py-4">{user.role}</td><td className="px-4 py-4">{user.status}</td><td className="px-4 py-4 text-slate-500">Role scoped</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  )
}
