import { motion } from 'framer-motion'
import { FiArrowRight, FiCheckCircle, FiLayers, FiShield, FiZap } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import Button from '../../components/Buttons/Button.jsx'

const features = [
  { icon: FiShield, title: 'Role-aware workflows', text: 'Every workspace role sees the controls and data it is permitted to use.' },
  { icon: FiLayers, title: 'Project intelligence', text: 'Group issues by product, sprint, severity, owner, and release risk.' },
  { icon: FiZap, title: 'Fast triage', text: 'Search, filter, assign, comment, and export without losing context.' }
]

export default function Landing() {
  return (
    <div className="bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 font-black text-white dark:bg-white dark:text-slate-950">WS</span>
            <span className="text-xl font-black">WorksSphere</span>
          </Link>
          <div className="hidden gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300 md:flex">
            <a href="#features">Features</a>
            <a href="#workflow">Workflow</a>
            <a href="#pricing">Pricing</a>
          </div>
          <Button to="/login">Login</Button>
        </div>
      </nav>
      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-[1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-sky-600">Track. Manage. Resolve.</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-tight sm:text-6xl">WorksSphere</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">A focused workspace for the full path from reported issue to verified release: triage, ownership, discussion, and insight.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/register" icon={FiArrowRight}>Start free</Button>
            <Button to="/login" variant="secondary">Sign in</Button>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
            {['Tenant isolated', 'Role governed', 'Evidence ready'].map((stat) => <div key={stat} className="rounded-xl border border-slate-200 bg-white/70 p-4 text-sm font-bold shadow-sm dark:border-slate-800 dark:bg-slate-900/70">{stat}</div>)}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <div className="rounded-lg bg-white p-5 dark:bg-slate-950">
            <div className="mb-5 flex items-center justify-between">
              <div>
              <p className="text-sm text-slate-500">Workflow overview</p>
                <h2 className="text-2xl font-black">Issue lifecycle</h2>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-600">Live workspace</span>
            </div>
            {['Report and triage', 'Assign and collaborate', 'Verify and close'].map((bug, index) => (
              <div key={bug} className="mb-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-bold">{bug}</p>
                  <span className="text-xs font-bold text-slate-500">STEP 0{index + 1}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-2 rounded-full bg-sky-500" style={{ width: `${74 - index * 16}%` }} /></div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
      <section id="features" className="border-y border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-5 md:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <Icon className="h-7 w-7 text-sky-600" />
                <h3 className="mt-5 text-xl font-black">{title}</h3>
                <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="workflow" className="mx-auto max-w-7xl px-4 py-20">
        <h2 className="text-3xl font-black">How it works</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {['Create bug', 'Assign owner', 'Resolve with comments', 'Report outcomes'].map((step) => <div key={step} className="flex items-center gap-3 rounded-lg border border-slate-200 p-5 font-bold dark:border-slate-800"><FiCheckCircle className="text-emerald-500" /> {step}</div>)}
        </div>
      </section>
      <section id="pricing" className="bg-slate-950 py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 md:grid-cols-3">
          {['Starter', 'Team', 'Enterprise'].map((plan, index) => <div key={plan} className="rounded-lg border border-white/10 p-6"><h3 className="text-2xl font-black">{plan}</h3><p className="mt-3 text-slate-300">{index === 0 ? 'Free' : `$${index * 19}/user`}</p><Button to="/register" className="mt-6 w-full" variant={index === 1 ? 'secondary' : 'primary'}>Choose plan</Button></div>)}
        </div>
      </section>
      <footer className="px-4 py-8 text-center text-sm text-slate-500">WorksSphere helps teams turn defects into shipped fixes.</footer>
    </div>
  )
}