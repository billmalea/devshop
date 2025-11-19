'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { Search, Eye } from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  status: string
  phone_number?: string
  total_amount: number
  payment_method?: string
  created_at: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 50

  useEffect(() => {
    fetchOrders()
  }, [page, searchTerm, statusFilter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const start = (page - 1) * pageSize
      const end = start + pageSize - 1

      let query = supabase.from('orders').select('*', { count: 'exact' })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      if (searchTerm) {
        query = query.or(`id.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%`)
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(start, end)

      if (error) throw error
      setOrders(data || [])
      setFilteredOrders(data || [])
      setTotal(count || 0)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error
      
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      alert('Order status updated')
    } catch (error) {
      console.error('Failed to update order:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && orders.length === 0) {
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Order Management</h1>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by order ID or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Order ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Total</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Payment</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm">{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4">{order.phone_number}</td>
                  <td className="px-6 py-4">KSh {parseFloat(String(order.total_amount)).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`px-2 py-1 rounded text-sm font-medium border-0 cursor-pointer ${getStatusColor(order.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm">{order.payment_method || 'M-Pesa'}</td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/orders/${order.id}`}>
                      <button className="p-2 hover:bg-gray-200 rounded">
                        <Eye size={18} />
                      </button>
                    </Link>
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
          Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} of {total} orders
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
