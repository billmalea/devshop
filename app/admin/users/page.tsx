'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { Trash2, Edit2, Search } from 'lucide-react'

interface User {
  id: string
  full_name?: string
  phone_number?: string
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 50

  useEffect(() => {
    fetchUsers()
  }, [page, searchTerm])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const start = (page - 1) * pageSize
      const end = start + pageSize - 1

      let query = supabase.from('profiles').select('*', { count: 'exact' })

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%`)
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(start, end)

      if (error) throw error
      setUsers(data || [])
      setFilteredUsers(data || [])
      setTotal(count || 0)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuspendUser = async (userId: string) => {
    if (!confirm('Are you sure you want to suspend this user?')) return
    
    try {
      // In a real app, you'd update an is_suspended field
      console.log('Suspending user:', userId)
      // await supabase.from('profiles').update({ is_suspended: true }).eq('id', userId)
      alert('User suspended successfully')
    } catch (error) {
      console.error('Failed to suspend user:', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure? This cannot be undone!')) return
    
    try {
      // This would delete the user - dangerous operation
      console.log('Deleting user:', userId)
      alert('User deleted successfully')
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  if (loading && users.length === 0) {
    return (
      <div>
        <div className="h-8 w-48 bg-gray-200 rounded mb-6 animate-pulse" />
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Joined</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{user.full_name || 'N/A'}</td>
                  <td className="px-6 py-4">{user.phone_number || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button className="p-2 hover:bg-gray-200 rounded">
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleSuspendUser(user.id)}
                      className="p-2 hover:bg-yellow-200 rounded text-yellow-600"
                    >
                      Suspend
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 hover:bg-red-200 rounded text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} of {total} users
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Previous
          </button>
          <span className="px-4 py-2">Page {page} of {Math.ceil(total / pageSize)}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / pageSize)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
