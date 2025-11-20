'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { Search, Eye } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
      case 'processing': return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      case 'shipped': return 'bg-purple-500/10 text-purple-600 border-purple-500/20'
      case 'delivered': return 'bg-green-500/10 text-green-600 border-green-500/20'
      case 'cancelled': return 'bg-red-500/10 text-red-600 border-red-500/20'
      default: return 'bg-secondary text-muted-foreground border-border'
    }
  }

  if (loading && orders.length === 0) {
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
      <div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground mt-2">Manage customer orders and track deliveries</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
          <Input
            type="text"
            placeholder="Search by order ID or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
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
      <div className="bg-background rounded-2xl border border-border overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-secondary/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Order ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Phone</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Total</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Payment</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-foreground">{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-muted-foreground">{order.phone_number}</td>
                  <td className="px-6 py-4 text-foreground font-medium">KSh {parseFloat(String(order.total_amount)).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer ${getStatusColor(order.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{order.payment_method || 'M-Pesa'}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Button asChild variant="ghost" size="icon" className="hover:bg-blue-500/10 hover:text-blue-600">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Eye size={18} />
                      </Link>
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
          Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} of {total} orders
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
