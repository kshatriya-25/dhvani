import LoadingSpinner from './LoadingSpinner'

export default function DataTable({ columns, data, loading, emptyMessage = 'No data found' }) {
  if (loading) return <LoadingSpinner />

  if (!data?.length) {
    return <p className="py-8 text-center text-gray-400 text-sm">{emptyMessage}</p>
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, i) => (
              <tr key={row.id || i} className="hover:bg-gray-50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="py-3 px-4 text-gray-700">
                    {col.render ? col.render(row, i) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-gray-100">
        {data.map((row, i) => (
          <div key={row.id || i} className="p-3 space-y-1.5">
            {columns.map((col) => {
              const value = col.render ? col.render(row, i) : row[col.key]
              if (value === undefined || value === null) return null
              return (
                <div key={col.key} className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium text-gray-500 shrink-0">{col.label}</span>
                  <span className="text-sm text-gray-700 text-right">{value}</span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </>
  )
}
