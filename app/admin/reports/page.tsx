'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface SalesData {
  date: string
  amount: number
}

interface ActivityData {
  date: string
  count: number
}

interface Order {
  created_at: string
  total_amount: number
}

interface Profile {
  created_at: string
}

export default function ReportsPage() {
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [userActivityData, setUserActivityData] = useState<ActivityData[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7days')

  useEffect(() => {
    fetchReports()
  }, [dateRange])

  const fetchReports = async () => {
    try {
      const supabase = createClient()

      // Fetch orders for sales report
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: true })

      if (ordersError) throw ordersError

      // Process sales data
      const sales: Record<string, number> = {}
      ordersData?.forEach((order: Order) => {
        const date = new Date(order.created_at).toLocaleDateString()
        sales[date] = (sales[date] || 0) + parseFloat(String(order.total_amount))
      })

      setSalesData(
        Object.entries(sales).map(([date, amount]) => ({
          date,
          amount: Number(amount)
        }))
      )

      // Fetch user data for activity report
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')

      if (profilesError) throw profilesError

      const activity: Record<string, number> = {}
      profilesData?.forEach((profile: Profile) => {
        const date = new Date(profile.created_at).toLocaleDateString()
        activity[date] = (activity[date] || 0) + 1
      })

      setUserActivityData(
        Object.entries(activity).map(([date, count]) => ({
          date,
          count: Number(count)
        }))
      )
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-64 bg-secondary rounded-lg animate-pulse" />
        <div className="bg-background rounded-2xl border border-border p-6">
          <div className="h-64 bg-secondary rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-2">Analytics and performance insights</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Sales Chart */}
      <div className="bg-background rounded-2xl border border-border p-6">
        <h2 className="text-xl font-heading font-bold text-foreground mb-6">Sales Revenue</h2>
        {salesData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `KSh ${value.toLocaleString()}`} />
              <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground">No sales data available</p>
        )}
      </div>

      {/* User Activity Chart */}
      <div className="bg-background rounded-2xl border border-border p-6">
        <h2 className="text-xl font-heading font-bold text-foreground mb-6">User Registrations</h2>
        {userActivityData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground">No activity data available</p>
        )}
      </div>
    </div>
  )
}
