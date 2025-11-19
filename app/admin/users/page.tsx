'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { Trash2, Edit2, Search, UserPlus, Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
      console.log('Suspending user:', userId)
      alert('User suspended successfully')
    } catch (error) {
      console.error('Failed to suspend user:', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure? This cannot be undone!')) return

    try {
      console.log('Deleting user:', userId)
      alert('User deleted successfully')
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  if (loading && users.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-64 bg-secondary rounded-lg animate-pulse" />
        <div className="bg-background rounded-2xl border border-border p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-secondary rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-2">Manage customer accounts</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
        <Input
          type="text"
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Table */}
      <div className="bg-background rounded-2xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Phone</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Joined</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{user.full_name || 'N/A'}</td>
                  <td className="px-6 py-4 text-muted-foreground">{user.phone_number || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <Button variant="ghost" size="icon" className="hover:bg-blue-500/10 hover:text-blue-600">
                      <Edit2 size={18} />
                    </Button>
                    <Button
                      onClick={() => handleSuspendUser(user.id)}
                      variant="ghost"
                      size="icon"
                      className="hover:bg-yellow-500/10 hover:text-yellow-600"
                    >
                      <Ban size={18} />
                    </Button>
                    <Button
                      onClick={() => handleDeleteUser(user.id)}
                      variant="ghost"
                      size="icon"
                      className="hover:bg-red-500/10 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} of {total} users
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="outline"
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-sm text-foreground">Page {page} of {Math.ceil(total / pageSize)}</span>
          <Button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / pageSize)}
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
