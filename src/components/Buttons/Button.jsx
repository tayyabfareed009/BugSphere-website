import { Link } from 'react-router-dom'

const variants = {
  primary: 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-sm shadow-indigo-500/25 hover:-translate-y-0.5 hover:shadow-md hover:shadow-indigo-500/30 active:translate-y-0',
  secondary: 'bg-white text-slate-700 ring-1 ring-slate-200 shadow-sm hover:-translate-y-0.5 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
  ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
}

export default function Button({ children, className = '', variant = 'primary', to, icon: Icon, ...props }) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`
  const content = (
    <>
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </>
  )

  if (to) return <Link to={to} className={classes}>{content}</Link>

  return <button className={classes} {...props}>{content}</button>
}
