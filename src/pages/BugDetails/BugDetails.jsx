import { Link, useParams } from 'react-router-dom'
import { FiEdit2, FiMessageSquare, FiPaperclip } from 'react-icons/fi'
import Button from '../../components/Buttons/Button.jsx'
import { bugs } from '../../utils/mockData.js'

export default function BugDetails() {
  const { id } = useParams()
  const bug = bugs.find((item) => item.id === id) || bugs[0]

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to="/bugs" className="text-sm font-semibold text-sky-600">Back to bugs</Link>
          <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{bug.id}: {bug.title}</h2>
          <p className="mt-3 max-w-3xl text-slate-500">{bug.description}</p>
        </div>
        <Button to={`/bugs/${bug.id}/edit`} icon={FiEdit2}>Edit Bug</Button>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xl font-black">Comments</h3>
          <div className="mt-5 grid gap-4">
            {bug.comments.length ? bug.comments.map((comment) => (
              <div key={comment.id} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex items-center justify-between"><p className="font-bold">{comment.author}</p><span className="text-xs text-slate-500">{comment.createdAt}</span></div>
                <p className="mt-2 text-slate-600 dark:text-slate-300">{comment.text}</p>
              </div>
            )) : <Empty icon={FiMessageSquare} text="No comments yet. Add a note for developers or testers." />}
          </div>
          <textarea className="mt-5 w-full rounded-lg border border-slate-200 bg-white p-3 outline-none focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950" rows={4} placeholder="Mention @teammate, add reproduction notes, or attach context." />
          <Button className="mt-3">Add Comment</Button>
        </section>
        <aside className="grid gap-5">
          <InfoCard title="Bug Details" items={[
            ['Project', bug.project],
            ['Priority', bug.priority],
            ['Severity', bug.severity],
            ['Status', bug.status],
            ['Reporter', bug.reporter],
            ['Assigned Developer', bug.assignee],
            ['Created Date', bug.createdAt],
            ['Updated Date', bug.updatedAt]
          ]} />
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-black">Attachments</h3>
            <div className="mt-4 grid gap-2">
              {bug.attachments.length ? bug.attachments.map((attachment) => <p key={attachment} className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-950"><FiPaperclip /> {attachment}</p>) : <Empty icon={FiPaperclip} text="No attachments uploaded." />}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-black">Activity Timeline</h3>
            <div className="mt-4 space-y-3">
              {bug.timeline.map((event) => <p key={event} className="border-l-2 border-sky-500 pl-3 text-sm text-slate-600 dark:text-slate-300">{event}</p>)}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function InfoCard({ title, items }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><h3 className="font-black">{title}</h3><dl className="mt-4 grid gap-3">{items.map(([label, value]) => <div key={label} className="flex justify-between gap-4 text-sm"><dt className="text-slate-500">{label}</dt><dd className="font-semibold text-slate-900 dark:text-white">{value}</dd></div>)}</dl></div>
}

function Empty({ icon: Icon, text }) {
  return <div className="rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500 dark:border-slate-700"><Icon className="mx-auto mb-2 h-5 w-5" />{text}</div>
}
