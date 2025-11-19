'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { Save } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    site_name: 'DevShop',
    site_email: 'support@devshop.ke',
    phone: '+254 7XX XXX XXXX',
    payment_methods: ['mpesa', 'pod'],
    shipping_methods: ['home_delivery', 'pickup_mtaani'],
    currency: 'KES',
    tax_rate: '0',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('settings')
        .select('*')

      if (error) throw error

      const settingsMap = {}
      data?.forEach(item => {
        settingsMap[item.key] = item.value
      })

      if (Object.keys(settingsMap).length > 0) {
        setSettings(prev => ({ ...prev, ...settingsMap }))
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const supabase = createClient()

      // Save each setting
      for (const [key, value] of Object.entries(settings)) {
        await supabase
          .from('settings')
          .upsert(
            { key, value },
            { onConflict: 'key' }
          )
      }

      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading settings...</div>
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">General Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Site Name</label>
            <input
              type="text"
              value={settings.site_name}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={settings.site_email}
                onChange={(e) => setSettings({ ...settings, site_email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <input
                type="text"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={settings.tax_rate}
                onChange={(e) => setSettings({ ...settings, tax_rate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Payment Methods</h2>
        <div className="space-y-2">
          {['mpesa', 'pod', 'bank_transfer'].map(method => (
            <label key={method} className="flex items-center">
              <input
                type="checkbox"
                checked={settings.payment_methods?.includes(method)}
                onChange={(e) => {
                  const methods = settings.payment_methods || []
                  if (e.target.checked) {
                    setSettings({
                      ...settings,
                      payment_methods: [...methods, method]
                    })
                  } else {
                    setSettings({
                      ...settings,
                      payment_methods: methods.filter(m => m !== method)
                    })
                  }
                }}
                className="w-4 h-4 mr-2"
              />
              <span className="capitalize">{method.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Shipping Methods */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Shipping Methods</h2>
        <div className="space-y-2">
          {['home_delivery', 'pickup_mtaani'].map(method => (
            <label key={method} className="flex items-center">
              <input
                type="checkbox"
                checked={settings.shipping_methods?.includes(method)}
                onChange={(e) => {
                  const methods = settings.shipping_methods || []
                  if (e.target.checked) {
                    setSettings({
                      ...settings,
                      shipping_methods: [...methods, method]
                    })
                  } else {
                    setSettings({
                      ...settings,
                      shipping_methods: methods.filter(m => m !== method)
                    })
                  }
                }}
                className="w-4 h-4 mr-2"
              />
              <span className="capitalize">{method.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
