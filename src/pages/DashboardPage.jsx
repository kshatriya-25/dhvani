import { Phone, Mic, Clock, Flag, Trophy, Star } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import StatsCard from '../components/StatsCard'
import DataTable from '../components/DataTable'
import LoadingSpinner from '../components/LoadingSpinner'
import { useApi } from '../hooks/useApi'
import { formatDuration } from '../utils/formatters'

const leaderboardColumns = [
  { key: 'rank', label: '#', render: (_, i) => i + 1 },
  { key: 'username', label: 'User' },
  { key: 'name', label: 'Name' },
  { key: 'total_calls', label: 'Calls' },
  { key: 'total_recordings', label: 'Recordings' },
  {
    key: 'avg_duration',
    label: 'Avg Duration',
    render: (row) => formatDuration(row.avg_duration),
  },
  {
    key: 'avg_rating',
    label: 'Avg Rating',
    render: (row) =>
      row.avg_rating ? (
        <span className="flex items-center gap-1">
          <Star size={14} className="fill-amber-400 text-amber-400" />
          {Number(row.avg_rating).toFixed(1)}
        </span>
      ) : (
        '—'
      ),
  },
]

export default function DashboardPage() {
  const { data: stats, loading: statsLoading } = useApi('/api/dashboard/stats')
  const { data: leaderboard, loading: lbLoading } = useApi('/api/dashboard/leaderboard')

  return (
    <DashboardLayout>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Dashboard</h1>

      {statsLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatsCard icon={Phone} label="Total Calls" value={stats?.total_calls} color="indigo" />
          <StatsCard icon={Mic} label="Recordings" value={stats?.total_recordings} color="green" />
          <StatsCard
            icon={Clock}
            label="Avg Duration"
            value={formatDuration(stats?.avg_duration)}
            color="amber"
          />
          <StatsCard icon={Flag} label="Flagged" value={stats?.total_flagged} color="red" />
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 p-3 sm:p-5 border-b border-gray-200">
          <Trophy size={20} className="text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">Leaderboard</h2>
        </div>
        <DataTable columns={leaderboardColumns} data={leaderboard} loading={lbLoading} />
      </div>
    </DashboardLayout>
  )
}
