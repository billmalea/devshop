'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { TrendingUp, Users, Package, ShoppingCart } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient()

        // Parallel queries for better performance
        const [
          { count: usersCount },
          { count: productsCount },
          { count: ordersCount },
          { data: revenueData },
          { count: pendingCount },
          { count: lowStockCount },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('total_amount'),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('products').select('*', { count: 'exact', head: true }).lt('stock', 5),
        ])

        const totalRevenue = revenueData?.reduce((sum: number, order: { total_amount: any }) => sum + Number(order.total_amount || 0), 0) || 0

        setStats({
          totalUsers: usersCount || 0,
          totalProducts: productsCount || 0,
          totalOrders: ordersCount || 0,
          totalRevenue,
          pendingOrders: pendingCount || 0,
          lowStockProducts: lowStockCount || 0,
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-100' },
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'bg-green-100' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'bg-purple-100' },
    { label: 'Total Revenue', value: `KSh ${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-yellow-100' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: ShoppingCart, color: 'bg-orange-100' },
    { label: 'Low Stock Items', value: stats.lowStockProducts, icon: Package, color: 'bg-red-100' },
  ]

  if (loading) {
    return (
      <div>
        <div className="h-8 w-48 bg-gray-200 rounded mb-8 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-4 w-24 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-2">{card.label}</p>
                  <p className="text-3xl font-bold text-black">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-gray-700" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/admin/products?action=new" className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
            Add Product
          </a>
          <a href="/admin/promotions?action=new" className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
            Create Promo
          </a>
          <a href="/admin/orders" className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
            View Orders
          </a>
          <a href="/admin/content" className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
            Edit Content
          </a>
        </div>
      </div>
    </div>
  )
}
