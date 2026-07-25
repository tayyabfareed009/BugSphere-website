import { useEffect, useState } from 'react'
import AnalyticsCharts from '../../components/Charts/AnalyticsCharts.jsx'
import api from '../../services/api.js'
import { PageHeader } from '../Projects/Projects.jsx'
export default function Reports() { const [reports, setReports] = useState(null); useEffect(() => { api.get('/reports').then(({ data }) => { console.log('[BugSphere] Reports loaded'); setReports(data) }).catch((error) => console.error('[BugSphere] Reports load failed', error)) }, []); return <div className="grid gap-6"><PageHeader title="Reports" text="Live organization analytics by issue status, priority, severity, and reporting volume." />{reports ? <AnalyticsCharts reports={reports} /> : <p className="py-10 text-center text-slate-500">Loading reports…</p>}</div> }
