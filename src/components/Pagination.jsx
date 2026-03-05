import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, onPageChange, hasNext = true, hasPrev = true }) {
  return (
    <div className="flex items-center justify-between py-3 px-3 sm:py-4 sm:px-4 border-t border-gray-100">
      <span className="text-xs sm:text-sm text-gray-500">Page {page}</span>
      <div className="flex gap-1.5 sm:gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev || page <= 1}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={14} /> Prev
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
