import { useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import DataTable from '../components/DataTable'
import Pagination from '../components/Pagination'
import AudioPlayer from '../components/AudioPlayer'
import RatingStars from '../components/RatingStars'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { useApi } from '../hooks/useApi'
import { formatDuration, formatDate } from '../utils/formatters'
import client from '../api/client'
import { Phone, User, Clock, ArrowDownLeft, ArrowUpRight, Smartphone, Info, Target, CheckCircle, FileText } from 'lucide-react'

const PAGE_SIZE = 20

const purposeColors = {
  Sales: 'indigo',
  Support: 'green',
  'Follow-up': 'amber',
  Enquiry: 'gray',
  Other: 'gray',
}

const outcomeColors = {
  Successful: 'green',
  'Callback needed': 'amber',
  'Not interested': 'red',
  'No answer': 'gray',
  Other: 'gray',
}

export default function CallsPage() {
  const [page, setPage] = useState(1)
  const [directionFilter, setDirectionFilter] = useState('')
  const [selectedCall, setSelectedCall] = useState(null)

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
      key: 'call_purpose',
      label: 'Purpose',
      render: (row) => row.call_purpose
        ? <Badge color={purposeColors[row.call_purpose] || 'gray'}>{row.call_purpose}</Badge>
        : <span className="text-gray-400 text-xs">—</span>,
    },
    {
      key: 'call_outcome',
      label: 'Outcome',
      render: (row) => row.call_outcome
        ? <Badge color={outcomeColors[row.call_outcome] || 'gray'}>{row.call_outcome}</Badge>
        : <span className="text-gray-400 text-xs">—</span>,
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
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <button
          onClick={() => setSelectedCall(row)}
          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          title="View details"
        >
          <Info size={16} />
        </button>
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

      <CallDetailModal
        call={selectedCall}
        onClose={() => setSelectedCall(null)}
        onRate={(score) => {
          if (selectedCall) {
            handleRate(selectedCall.id, score).then(() => {
              setSelectedCall((prev) => prev ? { ...prev, rating: { ...prev.rating, score } } : null)
            })
          }
        }}
      />
    </DashboardLayout>
  )
}

function CallDetailModal({ call, onClose, onRate }) {
  if (!call) return null

  return (
    <Modal open={!!call} onClose={onClose} title="Call Details">
      <div className="space-y-4">
        {/* Contact & Phone */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">
                {call.contact_name || 'No name provided'}
              </p>
              <p className="text-sm text-gray-500">{call.phone_number}</p>
            </div>
          </div>
          {!call.contact_name && (
            <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
              Contact name not filled by user
            </p>
          )}
        </div>

        {/* Call Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <DetailItem
            icon={call.direction === 'incoming' ? <ArrowDownLeft size={16} className="text-green-600" /> : <ArrowUpRight size={16} className="text-indigo-600" />}
            label="Direction"
            value={
              <Badge color={call.direction === 'incoming' ? 'green' : 'indigo'}>
                {call.direction}
              </Badge>
            }
          />
          <DetailItem
            icon={<Clock size={16} className="text-gray-500" />}
            label="Duration"
            value={formatDuration(call.duration)}
          />
          <DetailItem
            icon={<Phone size={16} className="text-gray-500" />}
            label="Started"
            value={formatDate(call.call_started_at)}
          />
          <DetailItem
            icon={<Clock size={16} className="text-gray-500" />}
            label="Ended"
            value={call.call_ended_at ? formatDate(call.call_ended_at) : '—'}
          />
        </div>

        {/* Post-Call Details */}
        <div className="border-t pt-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Post-Call Details</p>
          <div className="grid grid-cols-2 gap-3">
            <DetailItem
              icon={<Target size={16} className="text-indigo-500" />}
              label="Purpose"
              value={call.call_purpose
                ? <Badge color={purposeColors[call.call_purpose] || 'gray'}>{call.call_purpose}</Badge>
                : <span className="text-gray-400 text-sm">Not filled</span>
              }
            />
            <DetailItem
              icon={<CheckCircle size={16} className="text-green-500" />}
              label="Outcome"
              value={call.call_outcome
                ? <Badge color={outcomeColors[call.call_outcome] || 'gray'}>{call.call_outcome}</Badge>
                : <span className="text-gray-400 text-sm">Not filled</span>
              }
            />
          </div>
          {call.notes ? (
            <div className="mt-3 flex items-start gap-2">
              <FileText size={16} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Notes</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-1">{call.notes}</p>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex items-start gap-2">
              <FileText size={16} className="text-gray-300 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Notes</p>
                <p className="text-sm text-gray-400">No notes</p>
              </div>
            </div>
          )}
        </div>

        {/* Device Info */}
        {(call.device_model || call.device_os_version || call.app_version) && (
          <div className="border-t pt-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Device Info</p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Smartphone size={14} className="text-gray-400" />
              <span>
                {[call.device_model, call.device_os_version && `Android ${call.device_os_version}`, call.app_version && `v${call.app_version}`]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </div>
          </div>
        )}

        {/* Recording */}
        <div className="border-t pt-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Recording</p>
          {call.has_recording ? (
            <AudioPlayer callId={call.id} />
          ) : (
            <p className="text-sm text-gray-400">No recording available</p>
          )}
        </div>

        {/* Rating */}
        <div className="border-t pt-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Rating</p>
          <RatingStars value={call.rating?.score || 0} onChange={onRate} />
          {call.rating?.notes && (
            <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">{call.rating.notes}</p>
          )}
        </div>
      </div>
    </Modal>
  )
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <div className="text-sm font-medium text-gray-900">{value}</div>
      </div>
    </div>
  )
}
