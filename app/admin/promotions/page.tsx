'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { Trash2, Edit2, Plus } from 'lucide-react'

interface Promotion {
  id: string
  code: string
  description?: string
  discount_type: string
  discount_value: number
  min_purchase_amount?: number
  max_uses?: number
  uses_count?: number
  start_date?: string
  end_date?: string
  is_active: boolean
  created_at?: string
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_purchase_amount: '',
    max_uses: '',
    start_date: '',
    end_date: '',
  })

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPromotions(data || [])
    } catch (error) {
      console.error('Failed to fetch promotions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('promotions')
        .insert([
          {
            ...formData,
            discount_value: parseFloat(formData.discount_value),
            min_purchase_amount: formData.min_purchase_amount ? parseFloat(formData.min_purchase_amount) : null,
            max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
          }
        ])
        .select()

      if (error) throw error

      setPromotions([...promotions, data[0]])
      setFormData({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        min_purchase_amount: '',
        max_uses: '',
        start_date: '',
        end_date: '',
      })
      setShowForm(false)
      alert('Promotion created successfully!')
    } catch (error) {
      console.error('Failed to create promotion:', error)
      alert('Failed to create promotion')
    }
  }

  const handleDeletePromotion = async (promoId: string) => {
    if (!confirm('Delete this promotion?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', promoId)

      if (error) throw error
      setPromotions(promotions.filter(p => p.id !== promoId))
      alert('Promotion deleted')
    } catch (error) {
      console.error('Failed to delete promotion:', error)
    }
  }

  const togglePromoStatus = async (promo: Promotion) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('promotions')
        .update({ is_active: !promo.is_active })
        .eq('id', promo.id)

      if (error) throw error

      setPromotions(promotions.map(p =>
        p.id === promo.id ? { ...p, is_active: !p.is_active } : p
      ))
    } catch (error) {
      console.error('Failed to toggle promotion:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading promotions...</div>
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Promotional Tools</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 flex items-center gap-2"
        >
          <Plus size={20} />
          Create Promotion
        </button>
      </div>

      {/* Create Promo Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Create New Promotion</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Promo Code (e.g., SUMMER20)"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="col-span-2 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="col-span-2 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              rows={2}
            />
            <select
              value={formData.discount_type}
              onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount</option>
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="Discount Value"
              value={formData.discount_value}
              onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Min Purchase Amount (optional)"
              value={formData.min_purchase_amount}
              onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            />
            <input
              type="number"
              placeholder="Max Uses (optional)"
              value={formData.max_uses}
              onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            />
            <input
              type="datetime-local"
              placeholder="Start Date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            />
            <input
              type="datetime-local"
              placeholder="End Date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            />
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
                Create Promotion
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Promotions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Code</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Discount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Uses</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Valid Until</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promotions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No promotions yet
                </td>
              </tr>
            ) : (
              promotions.map((promo) => (
                <tr key={promo.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-lg">{promo.code}</td>
                  <td className="px-6 py-4">
                    {promo.discount_value}{promo.discount_type === 'percentage' ? '%' : ' KSh'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {promo.uses_count}/{promo.max_uses || '∞'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => togglePromoStatus(promo)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        promo.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {promo.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {promo.end_date ? new Date(promo.end_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button className="p-2 hover:bg-gray-200 rounded">
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeletePromotion(promo.id)}
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

      <div className="mt-4 text-sm text-gray-600">
        Showing {promotions.length} promotions
      </div>
    </div>
  )
}
