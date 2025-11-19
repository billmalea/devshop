"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Package, Truck, CreditCard, User, MapPin, Phone, Mail } from "lucide-react"
import Link from "next/link"

interface OrderDetails {
  id: string
  user_id: string
  total_amount: number
  status: string
  phone_number: string
  payment_method: string
  shipping_method: string
  shipping_address: string
  mpesa_transaction_id?: string
  created_at: string
  order_items: {
    id: string
    quantity: number
    price: number
    product: {
      name: string
      image_url?: string
    }
  }[]
  delivery_packages?: {
    package_id: string
    tracking_code?: string
    status: string
    delivery_fee?: number
    payment_mode: string
    mpesa_transaction_id?: string
  }[]
  profiles?: {
    full_name?: string
    phone_number?: string
  }
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params?.id as string
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price,
            product:products (
              name,
              image_url
            )
          ),
          delivery_packages (*),
          profiles (
            full_name,
            phone_number
          )
        `)
        .eq('id', orderId)
        .single()

      if (error) throw error
      setOrder(data as OrderDetails)
    } catch (error) {
      console.error('Failed to fetch order:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500'
      case 'processing': return 'bg-blue-500'
      case 'shipped': return 'bg-purple-500'
      case 'delivered': return 'bg-green-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]">Loading...</div>
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <Button asChild>
          <Link href="/admin/orders">Back to Orders</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
          <p className="text-muted-foreground">Order ID: {order.id}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge className={getStatusColor(order.status)}>
                {order.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-semibold">KES {order.total_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method</span>
              <span>{order.payment_method === 'mpesa' ? 'M-Pesa' : 'Cash on Delivery'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping Method</span>
              <span>{order.shipping_method === 'pickup_agent' ? 'Pickup Mtaani' : 'Home Delivery'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Date</span>
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            {order.mpesa_transaction_id && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">M-Pesa Ref</span>
                <span className="font-mono text-sm">{order.mpesa_transaction_id}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.profiles?.full_name && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{order.profiles.full_name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{order.phone_number}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{order.shipping_address}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-semibold">KES {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Info */}
      {order.delivery_packages && order.delivery_packages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.delivery_packages.map((pkg) => (
              <div key={pkg.package_id} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Package ID</span>
                  <span className="font-mono text-sm">{pkg.package_id}</span>
                </div>
                {pkg.tracking_code && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tracking Code</span>
                    <span className="font-mono text-sm">{pkg.tracking_code}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Status</span>
                  <Badge className={getStatusColor(pkg.status)}>
                    {pkg.status}
                  </Badge>
                </div>
                {pkg.delivery_fee && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>KES {pkg.delivery_fee.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Mode</span>
                  <span>{pkg.payment_mode}</span>
                </div>
                {pkg.mpesa_transaction_id && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">M-Pesa Ref</span>
                    <span className="font-mono text-sm">{pkg.mpesa_transaction_id}</span>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
