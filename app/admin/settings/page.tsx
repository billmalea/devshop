'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface Location {
  id: string
  name: string
  town?: string
  zone?: string
  area?: string
}

interface Zone {
  id: string
  name: string
}

interface Area {
  id: string
  name: string
  zone_id?: string
}

interface Agent {
  id: string
  business_name: string
  loc?: {
    name: string
    description: string
  }
}

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

  // Pickup Mtaani State
  const [areas, setAreas] = useState<Area[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedArea, setSelectedArea] = useState<string>('')
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [selectedAgent, setSelectedAgent] = useState<string>('')

  const [loading, setLoading] = useState(true)
  const [savingGeneral, setSavingGeneral] = useState(false)
  const [savingPickup, setSavingPickup] = useState(false)
  const [savingPayment, setSavingPayment] = useState(false)
  const [savingShipping, setSavingShipping] = useState(false)

  useEffect(() => {
    fetchSettings()
    fetchPickupMtaaniData()
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

      // Fetch app_settings for Pickup Mtaani
      const appSettingsRes = await fetch('/api/settings')
      const appSettingsData = await appSettingsRes.json()
      if (appSettingsData.settings?.pickup_mtaani_origin) {
        const origin = appSettingsData.settings.pickup_mtaani_origin
        setSelectedArea(origin.area || origin.area_id || '')
        setSelectedLocation(origin.location_id || '')
        setSelectedAgent(origin.agent_id || '')

        // Load locations for the saved area
        if (origin.area || origin.area_id) {
          const areaId = origin.area_id || origin.area
          const locsRes = await fetch(`/api/pickup-mtaani/locations?areaId=${areaId}`)
          const locsData = await locsRes.json()
          const locs = Array.isArray(locsData) ? locsData : (locsData.data || locsData.locations || [])
          setLocations(locs)

          // Load agents for saved location
          if (origin.location_id) {
            const agentsRes = await fetch(`/api/pickup-mtaani/agents?locationId=${origin.location_id}`)
            const agentsData = await agentsRes.json()
            const agentsList = Array.isArray(agentsData) ? agentsData : (agentsData.data || [])
            setAgents(agentsList)
          }
        }
      }

    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPickupMtaaniData = async () => {
    try {
      // Only fetch areas initially, locations will be loaded when area is selected
      const areasRes = await fetch('/api/pickup-mtaani/areas')
      const areasData = await areasRes.json()
      setAreas(Array.isArray(areasData) ? areasData : (areasData.data || []))
    } catch (error) {
      console.error('Failed to fetch Pickup Mtaani data:', error)
    }
  }

  const saveGeneralSettings = async () => {
    setSavingGeneral(true)
    try {
      const settingsToSave = [
        { key: 'site_name', value: settings.site_name },
        { key: 'site_email', value: settings.site_email },
        { key: 'phone', value: settings.phone },
        { key: 'currency', value: settings.currency },
        { key: 'tax_rate', value: settings.tax_rate },
      ]

      for (const setting of settingsToSave) {
        const response = await fetch('/api/admin/settings/general', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(setting)
        })

        if (!response.ok) throw new Error(`Failed to save ${setting.key}`)
      }

      toast.success('General settings saved successfully!')
    } catch (error) {
      console.error('Failed to save general settings:', error)
      toast.error('Failed to save general settings')
    } finally {
      setSavingGeneral(false)
    }
  }

  const savePickupSettings = async () => {
    setSavingPickup(true)
    try {
      if (!selectedAgent) {
        toast.error('Please select an agent')
        return
      }

      const location = locations.find(l => l.id === selectedLocation)
      const agent = agents.find(a => a.id === selectedAgent)

      const value = {
        area_id: selectedArea,
        location_id: selectedLocation,
        agent_id: selectedAgent,
        agent_name: agent?.business_name || '',
        location_name: location?.name || '',
        area: selectedArea // Legacy
      }

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'pickup_mtaani_origin',
          value
        })
      })

      if (!response.ok) throw new Error('Failed to save origin')

      toast.success('Pickup Mtaani settings saved!')
    } catch (error) {
      console.error('Failed to save pickup settings:', error)
      toast.error('Failed to save pickup settings')
    } finally {
      setSavingPickup(false)
    }
  }

  const savePaymentSettings = async () => {
    setSavingPayment(true)
    try {
      const response = await fetch('/api/admin/settings/general', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'payment_methods',
          value: settings.payment_methods
        })
      })

      if (!response.ok) throw new Error('Failed to save payment methods')

      toast.success('Payment methods saved!')
    } catch (error) {
      console.error('Failed to save payment settings:', error)
      toast.error('Failed to save payment settings')
    } finally {
      setSavingPayment(false)
    }
  }

  const saveShippingSettings = async () => {
    setSavingShipping(true)
    try {
      const response = await fetch('/api/admin/settings/general', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'shipping_methods',
          value: settings.shipping_methods
        })
      })

      if (!response.ok) throw new Error('Failed to save shipping methods')

      toast.success('Shipping methods saved!')
    } catch (error) {
      console.error('Failed to save shipping settings:', error)
      toast.error('Failed to save shipping settings')
    } finally {
      setSavingShipping(false)
    }
  }

  // Fetch locations when area is selected
  const handleAreaChange = async (areaId: string) => {
    setSelectedArea(areaId)
    setSelectedLocation('')
    setSelectedAgent('')
    setLocations([])
    setAgents([])

    if (areaId) {
      try {
        const response = await fetch(`/api/pickup-mtaani/locations?areaId=${areaId}`)
        const data = await response.json()
        const locs = Array.isArray(data) ? data : (data.data || data.locations || [])
        setLocations(locs)
      } catch (error) {
        console.error('Failed to fetch locations:', error)
        toast.error('Failed to load locations')
      }
    }
  }

  // Fetch agents when location is selected
  const handleLocationChange = async (locationId: string) => {
    setSelectedLocation(locationId)
    setSelectedAgent('')
    setAgents([])

    if (locationId) {
      try {
        const response = await fetch(`/api/pickup-mtaani/agents?locationId=${locationId}`)
        const data = await response.json()
        const agentsList = Array.isArray(data) ? data : (data.data || [])
        setAgents(agentsList)
      } catch (error) {
        console.error('Failed to fetch agents:', error)
        toast.error('Failed to load agents')
      }
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
        <div className="flex justify-end mt-4">
          <Button onClick={saveGeneralSettings} disabled={savingGeneral}>
            {savingGeneral ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save General Settings
          </Button>
        </div>
      </div>

      {/* Pickup Mtaani Configuration */}
      <div className="bg-background rounded-2xl border border-border p-6">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Pickup Mtaani Configuration</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Set the default drop-off point (Origin) for deliveries. This location will be used to calculate delivery fees.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Area / Region</label>
            <Select value={selectedArea} onValueChange={handleAreaChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Area" />
              </SelectTrigger>
              <SelectContent>
                {areas.map(area => (
                  <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Pickup Location</label>
            <Select
              value={selectedLocation}
              onValueChange={handleLocationChange}
              disabled={!selectedArea || locations.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={!selectedArea ? "Select area first" : locations.length === 0 ? "No locations available" : "Select Location"} />
              </SelectTrigger>
              <SelectContent>
                {locations.map(loc => (
                  <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Pickup Agent</label>
            <Select
              value={selectedAgent}
              onValueChange={setSelectedAgent}
              disabled={!selectedLocation || agents.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={!selectedLocation ? "Select location first" : agents.length === 0 ? "No agents available" : "Select Agent"} />
              </SelectTrigger>
              <SelectContent>
                {agents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>{agent.business_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={savePickupSettings} disabled={savingPickup}>
            {savingPickup ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Pickup Mtaani Settings
          </Button>
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
        <div className="flex justify-end mt-4">
          <Button onClick={savePaymentSettings} disabled={savingPayment}>
            {savingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Payment Methods
          </Button>
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
        <div className="flex justify-end mt-4">
          <Button onClick={saveShippingSettings} disabled={savingShipping}>
            {savingShipping ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Shipping Methods
          </Button>
        </div>
      </div>
    </div>
  )
}
