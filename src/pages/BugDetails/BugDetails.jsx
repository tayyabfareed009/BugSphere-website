import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiEdit2, FiPaperclip } from 'react-icons/fi';
import Button from '../../components/Buttons/Button.jsx';
import api from '../../services/api.js';

// ---------- Helper function (can be outside the component) ----------
const downloadFile = async (url, filename) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download failed:', error);
    // Fallback: open in new tab
    window.open(url, '_blank');
  }
};

export default function BugDetails() {
  const { id } = useParams();
  const [bug, setBug] = useState(null);
  const [comment, setComment] = useState('');

  const load = useCallback(async () => {
    try {
      console.log('[BugSphere] Loading bug', id);
      const { data } = await api.get(`/bugs/${id}`);
      setBug(data);
    } catch (error) {
      console.error('[BugSphere] Bug load failed', error);
    }
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => { load(); }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const submitComment = async () => {
    if (!comment.trim()) return;
    try {
      await api.post(`/bugs/${id}/comments`, { text: comment });
      setComment('');
      load();
    } catch (error) {
      console.error('[BugSphere] Comment failed', error);
    }
  };

  if (!bug) return <p className="py-10 text-center text-slate-500">Loading bug…</p>;

  const details = [
    ['Project', bug.project?.name],
    ['Priority', bug.priority],
    ['Severity', bug.severity],
    ['Status', bug.status],
    ['Reporter', bug.reporter?.name],
    ['Assignee', bug.assignedDeveloper?.name || 'Unassigned'],
    ['Due date', bug.dueDate ? new Date(bug.dueDate).toLocaleDateString() : '—'],
  ];

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div>
          <Link to="/bugs" className="text-sm font-semibold text-sky-600">Back to bugs</Link>
          <h2 className="mt-2 text-3xl font-black">{bug.bugId}: {bug.title}</h2>
          <p className="mt-3 max-w-3xl text-slate-500">{bug.description}</p>
        </div>
        <Button to={`/bugs/${bug._id}/edit`} icon={FiEdit2}>Edit bug</Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xl font-black">Comments</h3>
          <div className="mt-5 grid gap-4">
            {bug.comments?.length ? (
              bug.comments.map((item) => (
                <div key={item._id} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
                  <div className="flex justify-between">
                    <b>{item.author?.name}</b>
                    <span className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-2">{item.text}</p>
                </div>
              ))
            ) : (
              <Empty text="No comments yet." />
            )}
          </div>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="mt-5 w-full rounded-lg border border-slate-200 p-3 dark:border-slate-800 dark:bg-slate-950"
            rows={4}
            placeholder="Add a comment"
          />
          <Button className="mt-3" onClick={submitComment}>Add comment</Button>
        </section>

        <aside className="grid gap-5">
          <Card title="Bug details">
            <dl className="grid gap-3">
              {details.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 text-sm">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {/* ---------- ATTACHMENTS (modified) ---------- */}
          <Card title="Attachments">
            {bug.attachments?.length ? (
              bug.attachments.map((file) => (
                <button
                  key={file.publicId}
                  onClick={() => downloadFile(file.url, file.filename)}
                  className="flex w-full items-center gap-2 rounded-lg bg-slate-50 p-3 text-left text-sm dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <FiPaperclip /> {file.filename}
                </button>
              ))
            ) : (
              <Empty text="No attachments uploaded." />
            )}
          </Card>
          {/* --------------------------------------------- */}

          <Card title="Activity">
            {bug.activity?.length ? (
              bug.activity.map((entry) => (
                <p key={entry._id} className="border-l-2 border-sky-500 pl-3 text-sm">{entry.message}</p>
              ))
            ) : (
              <Empty text="No activity yet." />
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="font-black">{title}</h3>
      {children}
    </section>
  );
}

function Empty({ text }) {
  return (
    <p className="rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
      {text}
    </p>
  );
}