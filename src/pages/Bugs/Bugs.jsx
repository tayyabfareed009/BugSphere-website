import { useMemo, useState } from 'react'
import { FiDownload, FiPlus } from 'react-icons/fi'
import Button from '../../components/Buttons/Button.jsx'
import FilterSelect from '../../components/Filters/FilterSelect.jsx'
import SearchBar from '../../components/SearchBar/SearchBar.jsx'
import BugTable from '../../components/Tables/BugTable.jsx'
import { PRIORITIES, SEVERITIES, STATUSES } from '../../utils/constants.js'
import { bugs } from '../../utils/mockData.js'
import { PageHeader } from '../Projects/Projects.jsx'

export default function Bugs() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [priority, setPriority] = useState('All')
  const [severity, setSeverity] = useState('All')

  const filtered = useMemo(() => bugs.filter((bug) => {
    const text = `${bug.id} ${bug.title} ${bug.assignee} ${bug.project} ${bug.priority} ${bug.status} ${bug.reporter}`.toLowerCase()
    return text.includes(query.toLowerCase()) && (status === 'All' || bug.status === status) && (priority === 'All' || bug.priority === priority) && (severity === 'All' || bug.severity === severity)
  }), [query, status, priority, severity])

  const exportCsv = () => {
    const rows = [['Bug ID', 'Title', 'Project', 'Priority', 'Severity', 'Status', 'Reporter', 'Assignee'], ...filtered.map((bug) => [bug.id, bug.title, bug.project, bug.priority, bug.severity, bug.status, bug.reporter, bug.assignee])]
    const blob = new Blob([rows.map((row) => row.join(',')).join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'bugsphere-bugs.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid gap-6">
      <PageHeader title="Bugs" text="Search, sort, filter, assign, update, delete, and export tracked issues." action={<Button to="/bugs/new" icon={FiPlus}>Create Bug</Button>} />
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[1fr_repeat(3,180px)_auto]">
        <SearchBar value={query} onChange={setQuery} placeholder="Search by ID, title, developer, project, priority, status, reporter" />
        <FilterSelect label="Status" value={status} onChange={setStatus} options={['All', ...STATUSES]} />
        <FilterSelect label="Priority" value={priority} onChange={setPriority} options={['All', ...PRIORITIES]} />
        <FilterSelect label="Severity" value={severity} onChange={setSeverity} options={['All', ...SEVERITIES]} />
        <Button onClick={exportCsv} icon={FiDownload} variant="secondary" className="self-end">CSV</Button>
      </div>
      <BugTable bugs={filtered} />
    </div>
  )
}
