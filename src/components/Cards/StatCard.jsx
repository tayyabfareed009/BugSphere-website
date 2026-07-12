const tones = {
  sky: 'from-sky-500 to-cyan-500',
  amber: 'from-amber-500 to-orange-500',
  emerald: 'from-emerald-500 to-teal-500',
  rose: 'from-rose-500 to-pink-500'
}

export default function StatCard({ label, value, delta, tone = 'sky', icon: Icon }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{value}</h3>
        </div>
        <div className={`rounded-lg bg-gradient-to-br ${tones[tone]} p-3 text-white shadow-sm`}>
          {Icon ? <Icon className="h-5 w-5" /> : null}
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold text-emerald-600">{delta}</span> vs previous sprint</p>
    </div>
  )
}
