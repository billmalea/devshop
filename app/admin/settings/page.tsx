'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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

      const settingsMap: Record<string, string | string[]> = {}
      data?.forEach((item: { key: string | number; value: string | string[] }) => {
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
          <h1 className="text-4xl font-heading font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Configure store settings and preferences</p>
        </div>
        <Button
          onClick={handleSaveSettings}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* General Settings */}
      <div className="bg-background rounded-2xl border border-border p-6">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-6">General Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Site Name</label>
            <Input
              type="text"
              value={settings.site_name}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
              <Input
                type="email"
                value={settings.site_email}
                onChange={(e) => setSettings({ ...settings, site_email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Phone</label>
              <Input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Currency</label>
              <Input
                type="text"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Tax Rate (%)</label>
              <Input
                type="number"
                step="0.1"
                value={settings.tax_rate}
                onChange={(e) => setSettings({ ...settings, tax_rate: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-background rounded-2xl border border-border p-6">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Payment Methods</h2>
        <div className="space-y-3">
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
                className="w-4 h-4 mr-3 border-border"
              />
              <span className="capitalize text-foreground">{method.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Shipping Methods */}
      <div className="bg-background rounded-2xl border border-border p-6">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Shipping Methods</h2>
        <div className="space-y-3">
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
                className="w-4 h-4 mr-3 border-border"
              />
              <span className="capitalize text-foreground">{method.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
