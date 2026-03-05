import { Menu, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth()

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6">
      <button onClick={onMenuClick} className="lg:hidden p-1 text-gray-500 hover:text-gray-700">
        <Menu size={22} />
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-2 sm:gap-4">
        <span className="text-sm text-gray-600 hidden sm:inline">
          {user?.full_name || user?.username}
        </span>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}
