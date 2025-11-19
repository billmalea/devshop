'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { Trash2, Edit2, Plus, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
    return (
      <div className="space-y-6">
        <div className="h-12 w-64 bg-secondary rounded-lg animate-pulse" />
        <div className="bg-background rounded-2xl border border-border p-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
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
          <h1 className="text-4xl font-heading font-bold text-foreground">Promotions</h1>
          <p className="text-muted-foreground mt-2">Create and manage discount codes</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Promotion
        </Button>
      </div>

      {/* Create Promo Form */}
      {showForm && (
        <div className="bg-background rounded-2xl border border-border p-6">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Create New Promotion</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <Input
              type="text"
              placeholder="Promo Code (e.g., SUMMER20)"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="col-span-2"
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="col-span-2 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
              rows={2}
            />
            <select
              value={formData.discount_type}
              onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
              className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount</option>
            </select>
            <Input
              type="number"
              step="0.01"
              placeholder="Discount Value"
              value={formData.discount_value}
              onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
              required
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Min Purchase Amount (optional)"
              value={formData.min_purchase_amount}
              onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Max Uses (optional)"
              value={formData.max_uses}
              onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
            />
            <Input
              type="datetime-local"
              placeholder="Start Date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
            <Input
              type="datetime-local"
              placeholder="End Date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
            <div className="col-span-2 flex gap-2">
              <Button type="submit" className="bg-foreground text-background hover:bg-foreground/90">
                Create Promotion
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Promotions Table */}
      <div className="bg-background rounded-2xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Code</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Discount</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Uses</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Valid Until</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promotions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                  No promotions yet
                </td>
              </tr>
            ) : (
              promotions.map((promo) => (
                <tr key={promo.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-lg text-foreground">{promo.code}</td>
                  <td className="px-6 py-4 text-foreground">
                    {promo.discount_value}{promo.discount_type === 'percentage' ? '%' : ' KSh'}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {promo.uses_count}/{promo.max_uses || '∞'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => togglePromoStatus(promo)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${promo.is_active
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-secondary text-muted-foreground'
                        }`}
                    >
                      {promo.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {promo.end_date ? new Date(promo.end_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <Button variant="ghost" size="icon" className="hover:bg-blue-500/10 hover:text-blue-600">
                      <Edit2 size={18} />
                    </Button>
                    <Button
                      onClick={() => handleDeletePromotion(promo.id)}
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

      <div className="text-sm text-muted-foreground">
        Showing {promotions.length} promotions
      </div>
    </div>
  )
}
