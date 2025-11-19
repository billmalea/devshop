"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Package, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface DeliveryPackage {
  id: string
  tracking_code: string
  status: string
  recipient_name: string
  recipient_phone: string
  package_description: string
  delivery_fee: number
  origin: string
  destination: string
  payment_mode: string
  created_at: string
}

export default function DeliveriesPage() {
  const [packages, setPackages] = useState<DeliveryPackage[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPackages = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pickup-mtaani/packages')
      if (res.ok) {
        const data = await res.json()
        setPackages(data.data || [])
      } else {
        toast.error('Failed to load deliveries')
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
      toast.error('Error loading deliveries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower.includes('delivered')) return 'bg-green-500'
    if (statusLower.includes('transit')) return 'bg-blue-500'
    if (statusLower.includes('pending')) return 'bg-yellow-500'
    if (statusLower.includes('cancelled')) return 'bg-red-500'
    return 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deliveries</h1>
          <p className="text-muted-foreground">
            Manage your Pickup Mtaani deliveries
          </p>
        </div>
        <Button onClick={fetchPackages} disabled={loading} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : packages.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[400px] flex-col items-center justify-center">
            <Package className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No deliveries yet</h3>
            <p className="text-sm text-muted-foreground">
              Deliveries will appear here when customers place orders
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {packages.map((pkg) => (
            <Card key={pkg.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {pkg.tracking_code || pkg.id}
                    </CardTitle>
                    <CardDescription>{pkg.package_description}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(pkg.status)}>
                    {pkg.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-semibold">Recipient</h4>
                    <p className="text-sm">{pkg.recipient_name}</p>
                    <p className="text-sm text-muted-foreground">{pkg.recipient_phone}</p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold">Delivery Details</h4>
                    <p className="text-sm">
                      From: <span className="font-medium">{pkg.origin}</span>
                    </p>
                    <p className="text-sm">
                      To: <span className="font-medium">{pkg.destination}</span>
                    </p>
                    <p className="text-sm">
                      Fee: <span className="font-medium">KES {pkg.delivery_fee}</span>
                    </p>
                    <p className="text-sm">
                      Payment: <span className="font-medium">{pkg.payment_mode}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
