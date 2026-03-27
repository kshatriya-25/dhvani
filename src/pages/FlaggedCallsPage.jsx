import { useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import DataTable from '../components/DataTable'
import Pagination from '../components/Pagination'
import Badge from '../components/Badge'
import { useApi } from '../hooks/useApi'
import { formatDuration, formatDate } from '../utils/formatters'

const PAGE_SIZE = 20

export default function FlaggedCallsPage() {
  const [page, setPage] = useState(1)

  const params = {
    skip: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
  }

  const { data, loading } = useApi('/api/dashboard/flagged', params, [page])

  const calls = Array.isArray(data) ? data : []

  const columns = [
    { key: 'call_id', label: 'Call ID', render: (row) => <span className="font-mono text-xs">{row.call_id}</span> },
    { key: 'username', label: 'User' },
    { key: 'phone_number', label: 'Phone' },
    { key: 'contact_name', label: 'Contact', render: (row) => row.contact_name || '—' },
    {
      key: 'direction',
      label: 'Direction',
      render: (row) => (
        <Badge color={row.direction === 'incoming' ? 'green' : 'indigo'}>
          {row.direction}
        </Badge>
      ),
    },
    { key: 'call_purpose', label: 'Purpose', render: (row) => row.call_purpose ? <Badge color="indigo">{row.call_purpose}</Badge> : '—' },
    { key: 'call_outcome', label: 'Outcome', render: (row) => row.call_outcome ? <Badge color="amber">{row.call_outcome}</Badge> : '—' },
    {
      key: 'duration',
      label: 'Duration',
      render: (row) => formatDuration(row.duration),
    },
    {
      key: 'rating_score',
      label: 'Rating',
      render: (row) => <Badge color="red">{row.rating_score}/5</Badge>,
    },
    { key: 'rating_notes', label: 'Notes', render: (row) => row.rating_notes || '—' },
    {
      key: 'flagged_at',
      label: 'Flagged At',
      render: (row) => formatDate(row.flagged_at),
    },
  ]

  return (
    <DashboardLayout>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Flagged Calls</h1>

      <div className="bg-white rounded-xl border border-gray-200">
        <DataTable columns={columns} data={calls} loading={loading} emptyMessage="No flagged calls" />
        <Pagination
          page={page}
          onPageChange={setPage}
          hasNext={calls.length >= PAGE_SIZE}
          hasPrev={page > 1}
        />
      </div>
    </DashboardLayout>
  )
}
