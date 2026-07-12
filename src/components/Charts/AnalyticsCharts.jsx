import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { monthlyReports, priorityChart, statusChart } from '../../utils/mockData.js'

const colors = ['#0ea5e9', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b']

export default function AnalyticsCharts() {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <ChartCard title="Monthly Bug Reports" className="xl:col-span-2">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyReports}>
            <defs>
              <linearGradient id="bugs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="bugs" stroke="#0ea5e9" fill="url(#bugs)" />
            <Area type="monotone" dataKey="resolved" stroke="#14b8a6" fill="#14b8a61f" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Bugs by Status">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={statusChart} dataKey="value" innerRadius={72} outerRadius={108} paddingAngle={4}>
              {statusChart.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Bugs by Priority" className="xl:col-span-3">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={priorityChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#0f172a" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

function ChartCard({ title, className = '', children }) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      <h3 className="mb-4 text-lg font-bold text-slate-950 dark:text-white">{title}</h3>
      {children}
    </div>
  )
}
