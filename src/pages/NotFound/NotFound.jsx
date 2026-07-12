import Button from '../../components/Buttons/Button.jsx'

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 text-center dark:bg-slate-950">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.25em] text-sky-600">404</p>
        <h1 className="mt-3 text-5xl font-black text-slate-950 dark:text-white">Page not found</h1>
        <p className="mt-4 text-slate-500">The route you requested does not exist in BugSphere.</p>
        <Button to="/" className="mt-8">Go Home</Button>
      </div>
    </div>
  )
}
