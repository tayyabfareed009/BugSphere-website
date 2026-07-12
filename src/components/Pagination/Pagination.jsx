import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function Pagination({ page = 1, total = 5 }) {
  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
      <span className="text-slate-500 dark:text-slate-400">Page {page} of {total}</span>
      <div className="flex gap-2">
        <button className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800" aria-label="Previous page"><FiChevronLeft /></button>
        <button className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800" aria-label="Next page"><FiChevronRight /></button>
      </div>
    </div>
  )
}
