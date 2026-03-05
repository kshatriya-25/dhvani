import { useState, useCallback } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import DataTable from '../components/DataTable'
import Pagination from '../components/Pagination'
import AudioPlayer from '../components/AudioPlayer'
import RatingStars from '../components/RatingStars'
import Badge from '../components/Badge'
import { useApi } from '../hooks/useApi'
import { formatDuration, formatDate } from '../utils/formatters'
import client from '../api/client'

const PAGE_SIZE = 20

export default function CallsPage() {
  const [page, setPage] = useState(1)
  const [directionFilter, setDirectionFilter] = useState('')

  const params = {
    page,
    page_size: PAGE_SIZE,
    ...(directionFilter && { direction: directionFilter }),
  }

  const { data, loading, refetch } = useApi('/api/calls/', params, [page, directionFilter])

  const calls = data?.calls || []
  const total = data?.total || 0

  const handleRate = async (callId, score) => {
    try {
      await client.post(`/api/calls/${callId}/rating`, { score })
      refetch()
    } catch {
      // ignore
    }
  }

  const columns = [
    { key: 'id', label: 'ID', render: (row) => <span className="font-mono text-xs">{row.id}</span> },
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
    {
      key: 'duration',
      label: 'Duration',
      render: (row) => formatDuration(row.duration),
    },
    {
      key: 'call_started_at',
      label: 'Date',
      render: (row) => formatDate(row.call_started_at),
    },
    {
      key: 'recording',
      label: 'Recording',
      render: (row) => row.has_recording ? <AudioPlayer callId={row.id} /> : <span className="text-gray-400 text-xs">None</span>,
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (row) => (
        <RatingStars value={row.rating?.score || 0} onChange={(val) => handleRate(row.id, val)} />
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Calls</h1>
        <div className="flex gap-2 sm:gap-3">
          <select
            value={directionFilter}
            onChange={(e) => {
              setDirectionFilter(e.target.value)
              setPage(1)
            }}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Directions</option>
            <option value="incoming">Incoming</option>
            <option value="outgoing">Outgoing</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <DataTable columns={columns} data={calls} loading={loading} />
        <Pagination
          page={page}
          onPageChange={setPage}
          hasNext={page * PAGE_SIZE < total}
          hasPrev={page > 1}
        />
      </div>
    </DashboardLayout>
  )
}
