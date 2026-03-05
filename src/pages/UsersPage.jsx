import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import { useApi } from '../hooks/useApi'
import client from '../api/client'

export default function UsersPage() {
  const { data, loading, refetch } = useApi('/api/users/users/')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', username: '', email: '', phone: '', password: '', role: 'user' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const users = Array.isArray(data) ? data : []

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', username: '', email: '', phone: '', password: '', role: 'user' })
    setError('')
    setModalOpen(true)
  }

  const openEdit = (user) => {
    setEditing(user)
    setForm({ name: user.name || '', username: user.username, email: user.email || '', phone: user.phone || '', password: '', role: user.role })
    setError('')
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await client.patch(`/api/users/users/${editing.id}`, {
          name: form.name,
          email: form.email,
          phone: form.phone || null,
        })
      } else {
        await client.post('/api/users/', {
          name: form.name,
          username: form.username,
          email: form.email,
          phone: form.phone || null,
          password: form.password,
        })
      }
      setModalOpen(false)
      refetch()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (user) => {
    if (!confirm(`Delete user "${user.username}"?`)) return
    try {
      await client.delete(`/api/users/users/${user.id}`)
      refetch()
    } catch {
      // ignore
    }
  }

  const columns = [
    { key: 'id', label: 'ID', render: (row) => <span className="font-mono text-xs">{row.id}</span> },
    { key: 'username', label: 'Username' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', render: (row) => row.phone || '—' },
    {
      key: 'role',
      label: 'Role',
      render: (row) => <Badge color={row.role === 'admin' ? 'indigo' : 'gray'}>{row.role}</Badge>,
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (row) => (
        <Badge color={row.is_active ? 'green' : 'red'}>
          {row.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors">
            <Pencil size={15} />
          </button>
          <button onClick={() => handleDelete(row)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Users</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> <span className="hidden sm:inline">Add User</span><span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <DataTable columns={columns} data={users} loading={loading} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit User' : 'Create User'}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
        )}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {!editing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Optional"
            />
          </div>
          {!editing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Min 8 chars, upper+lower+digit+special"
              />
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
