'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ReportsPage() {
  const [salesData, setSalesData] = useState([])
  const [userActivityData, setUserActivityData] = useState([])
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
      const sales = {}
      ordersData?.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString()
        sales[date] = (sales[date] || 0) + parseFloat(order.total_amount)
      })

      setSalesData(
        Object.entries(sales).map(([date, amount]) => ({
          date,
          amount: parseFloat(amount)
        }))
      )

      // Fetch user data for activity report
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')

      if (profilesError) throw profilesError

      const activity = {}
      profilesData?.forEach(profile => {
        const date = new Date(profile.created_at).toLocaleDateString()
        activity[date] = (activity[date] || 0) + 1
      })

      setUserActivityData(
        Object.entries(activity).map(([date, count]) => ({
          date,
          count
        }))
      )
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading reports...</div>
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Sales Revenue</h2>
        {salesData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `KSh ${value.toLocaleString()}`} />
              <Line type="monotone" dataKey="amount" stroke="#000" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No sales data available</p>
        )}
      </div>

      {/* User Activity Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">User Registrations</h2>
        {userActivityData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#000" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No activity data available</p>
        )}
      </div>
    </div>
  )
}
