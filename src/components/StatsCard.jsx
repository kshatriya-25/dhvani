export default function StatsCard({ icon: Icon, label, value, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-2 sm:mb-3">
        <div className={`p-1.5 sm:p-2 rounded-lg ${colors[color] || colors.indigo}`}>
          <Icon size={18} className="sm:w-5 sm:h-5" />
        </div>
        <span className="text-xs sm:text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-gray-900">{value ?? '—'}</p>
    </div>
  )
}
