const tones = {
  sky: 'from-sky-500 to-cyan-500',
  amber: 'from-amber-500 to-orange-500',
  emerald: 'from-emerald-500 to-teal-500',
  rose: 'from-rose-500 to-pink-500'
}

export default function StatCard({ label, value, delta, trend, tone = 'sky', icon: Icon }) {
  return (
    <div className="animate-rise-in rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_-18px_rgba(15,23,42,.35)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_36px_-20px_rgba(15,23,42,.35)] dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{value}</h3>
        </div>
        <div className={`rounded-lg bg-gradient-to-br ${tones[tone]} p-3 text-white shadow-sm`}>
          {Icon ? <Icon className="h-5 w-5" /> : null}
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{trend || <><span className="font-semibold text-emerald-600">{delta}</span> vs previous sprint</>}</p>
    </div>
  )
}
