'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { TrendingUp, Users, Package, ShoppingCart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-500/10', iconColor: 'text-blue-600' },
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'bg-green-500/10', iconColor: 'text-green-600' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'bg-purple-500/10', iconColor: 'text-purple-600' },
    { label: 'Total Revenue', value: `KSh ${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-yellow-500/10', iconColor: 'text-yellow-600' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: ShoppingCart, color: 'bg-orange-500/10', iconColor: 'text-orange-600' },
    { label: 'Low Stock Items', value: stats.lowStockProducts, icon: Package, color: 'bg-red-500/10', iconColor: 'text-red-600' },
  ]

  if (loading) {
    return (
      <div>
        <div className="h-10 w-64 bg-secondary rounded-lg mb-8 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-background rounded-2xl border border-border p-6">
              <div className="h-4 w-24 bg-secondary rounded mb-4 animate-pulse" />
              <div className="h-8 w-32 bg-secondary rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">Overview of your store's performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <div key={idx} className="bg-background rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">{card.label}</p>
                  <p className="text-3xl font-bold text-foreground">{card.value}</p>
                </div>
                <div className={`${card.color} p-4 rounded-xl`}>
                  <Icon size={24} className={card.iconColor} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-background rounded-2xl border border-border p-6">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button asChild variant="outline" className="h-auto py-4 justify-between group">
            <Link href="/admin/products?action=new">
              <span>Add Product</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4 justify-between group">
            <Link href="/admin/promotions?action=new">
              <span>Create Promo</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4 justify-between group">
            <Link href="/admin/orders">
              <span>View Orders</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4 justify-between group">
            <Link href="/admin/content">
              <span>Edit Content</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
