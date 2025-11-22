"use client"

import { useEffect, useState } from "react"
import { useCart } from "@/components/cart-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, CheckCircle2, Truck, MapPin, Smartphone, Banknote, Home } from 'lucide-react'
import Link from "next/link"
import { createClient as createBrowserSupabase } from "@/lib/client"

interface Location {
  id: string
  name: string
  town?: string
  zone?: string
  area?: string
  agent_id?: string
}

interface Agent {
  id: string
  business_name: string
  loc?: {
    name: string
    description: string
  }
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Location State
  const [areas, setAreas] = useState<{ id: string, name: string }[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [doorstepDestinations, setDoorstepDestinations] = useState<Location[]>([])

  const [selectedArea, setSelectedArea] = useState<string>('')

  const [locationsLoading, setLocationsLoading] = useState(false)
  const [agentsLoading, setAgentsLoading] = useState(false)
  const [doorstepLoading, setDoorstepLoading] = useState(false)
  const [originAgentId, setOriginAgentId] = useState<string>('')

  const [deliveryCharge, setDeliveryCharge] = useState<number | null>(null)
  const [deliveryChargeLoading, setDeliveryChargeLoading] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")

  const [shippingMethod, setShippingMethod] = useState<"pickup" | "doorstep">("pickup")
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "cod">("mpesa")
  const [pickupLocation, setPickupLocation] = useState("")
  const [pickupAgent, setPickupAgent] = useState("")
  const [doorstepLocation, setDoorstepLocation] = useState("")
  const [profilePhonePresent, setProfilePhonePresent] = useState(false)

  const formattedTotal = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(totalPrice)

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLocationsLoading(true)
      try {
        // Fetch Settings for Origin
        const settingsRes = await fetch('/api/settings')
        const settingsData = await settingsRes.json()
        if (settingsData.settings?.pickup_mtaani_origin?.agent_id) {
          setOriginAgentId(settingsData.settings.pickup_mtaani_origin.agent_id)
        } else if (settingsData.settings?.pickup_mtaani_origin?.location_id) {
          setOriginAgentId(settingsData.settings.pickup_mtaani_origin.location_id)
        }

        // Fetch Areas only (locations and doorstep destinations loaded on area selection)
        const areasRes = await fetch('/api/pickup-mtaani/areas')

        if (areasRes.ok) {
          const data = await areasRes.json()
          setAreas(Array.isArray(data) ? data : (data.data || []))
        }
      } catch (e) {
        console.error('Failed to fetch data', e)
        toast.error('Could not load areas')
      } finally {
        setLocationsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Calculate delivery charge
  useEffect(() => {
    const calcCharge = async () => {
      const destination = shippingMethod === 'pickup' ? pickupAgent : doorstepLocation

      if (!destination || !originAgentId) {
        setDeliveryCharge(null)
        return
      }

      setDeliveryChargeLoading(true)
      try {
        const res = await fetch('/api/pickup-mtaani/delivery-charge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: shippingMethod === 'pickup' ? 'agent' : 'doorstep',
            origin: originAgentId,
            destination: destination
          })
        })

        if (res.ok) {
          const data = await res.json()
          // Handle both amount and price fields from API
          const charge = data.amount ?? data.price ?? data.data?.amount ?? data.data?.price

          if (typeof charge === 'number') {
            setDeliveryCharge(charge)
          } else {
            setDeliveryCharge(null)
          }
        } else {
          setDeliveryCharge(null)
        }
      } catch (e) {
        console.error('Failed to calculate delivery charge', e)
        setDeliveryCharge(null)
      } finally {
        setDeliveryChargeLoading(false)
      }
    }
    calcCharge()
  }, [shippingMethod, pickupAgent, doorstepLocation, originAgentId])



  // Prefill from Supabase profile
  useEffect(() => {
    const prefill = async () => {
      try {
        const supabase = createBrowserSupabase()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        // Email
        if (user.email) setEmail((prev) => prev || user.email!)

        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, phone_number")
          .eq("id", user.id)
          .maybeSingle()

        // Name handling
        const meta = (user.user_metadata as { full_name?: string } | null) || null
        const fullName = profile?.full_name || meta?.full_name || ""
        if (fullName && (!firstName || !lastName)) {
          const parts = String(fullName).trim().split(/\s+/)
          setFirstName((prev) => prev || parts[0] || "")
          setLastName((prev) => prev || parts.slice(1).join(" ") || "")
        }

        // Phone
        if (profile?.phone_number) {
          setPhoneNumber((prev) => prev || profile.phone_number!)
          setProfilePhonePresent(true)
        }
      } catch (e) {
        console.error("Prefill error", e)
      }
    }
    prefill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (shippingMethod === "pickup" && !pickupAgent) {
      toast.error("Please select a pickup agent")
      return
    }

    if (shippingMethod === "doorstep" && !doorstepLocation) {
      toast.error("Please select a doorstep location")
      return
    }

    if (paymentMethod === "mpesa") {
      if (!phoneNumber.match(/^(?:254|\+254|0)?(7(?:(?:[129][0-9])|(?:0[0-8])|(4[0-1]))[0-9]{6})$/)) {
        toast.error("Please enter a valid Safaricom number")
        return
      }
    }

    setIsLoading(true)

    // Persist phone if newly provided and not stored
    try {
      if (phoneNumber && !profilePhonePresent) {
        const supabase = createBrowserSupabase()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from("profiles").update({ phone_number: phoneNumber }).eq("id", user.id)
          setProfilePhonePresent(true)
        }
      }
    } catch (err) {
      console.error("Failed to persist phone number", err)
    }

    // 1. Create order in database (pending)
    let orderId: string | null = null
    try {
      const supabase = createBrowserSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let shippingAddr = ''
      if (shippingMethod === 'pickup') shippingAddr = `Pickup Agent ID: ${pickupAgent}`
      else if (shippingMethod === 'doorstep') shippingAddr = `Doorstep: ${doorstepLocation}`

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: totalPrice,
          status: 'pending',
          phone_number: phoneNumber,
          payment_method: paymentMethod,
          shipping_method: shippingMethod === 'pickup' ? 'pickup_agent' : 'doorstep_delivery',
          shipping_address: shippingAddr
        })
        .select()
        .single()
      if (error) throw error
      orderId = order.id
      // Insert order_items
      const itemsPayload = items.map(i => ({
        order_id: orderId,
        product_id: i.id,
        quantity: i.quantity,
        price: i.price
      }))
      const { error: itemsErr } = await supabase.from('order_items').insert(itemsPayload)
      if (itemsErr) console.error('Order items insert error', itemsErr)
      // Decrement inventory
      for (const i of items) {
        await supabase.rpc('decrement_stock', { p_product_id: i.id, p_qty: i.quantity }).catch(() => { })
      }
    } catch (err) {
      console.error('Order creation failed', err)
      toast.error('Failed to create order')
    }

    // 2. Create Pickup Mtaani package (if pickup or doorstep)
    let packageId: string | null = null
    if (orderId && (shippingMethod === 'pickup' || shippingMethod === 'doorstep')) {
      if (!originAgentId) {
        toast.error('Pickup Mtaani origin ID not configured')
      } else {
        try {
          // TODO: Use correct endpoint for doorstep if different
          // Assuming same endpoint but different payload might be needed?
          // For now using the same package creation but we might need to adjust for doorstep
          // The API docs for 'Create Agent to Agent Package' was /packages/agent-agent
          // Doorstep might be different. 
          // Since we don't have full docs, we'll use the same endpoint but be aware it might fail for doorstep if it expects agent ID
          // Actually, for doorstep, we probably need a different endpoint or payload.
          // But let's try to use the existing one with the selected location ID.

          const res = await fetch('/api/pickup-mtaani/packages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              originId: originAgentId,
              destinationId: shippingMethod === 'pickup' ? pickupAgent : doorstepLocation,
              packageDescription: `Order ${orderId} with ${items.length} item(s)`,
              recipientName: `${firstName} ${lastName}`.trim(),
              recipientPhone: phoneNumber,
              paymentMode: paymentMethod === 'cod' ? 'COD' : 'PREPAID',
              codAmount: paymentMethod === 'cod' ? totalPrice : undefined,
              value: totalPrice,
              type: shippingMethod === 'pickup' ? 'agent' : 'doorstep',
              deliveryAddress: shippingMethod === 'doorstep' ? `${address}, ${city}` : undefined,
            })
          })
          if (res.ok) {
            const pkg = await res.json()
            packageId = pkg.id
            toast.success(`Delivery package created (${pkg.tracking_code || pkg.id})`)
            // Persist package record
            const supabase = createBrowserSupabase()
            await supabase.from('delivery_packages').insert({
              order_id: orderId,
              package_id: pkg.id,
              tracking_code: pkg.tracking_code,
              status: pkg.status || 'created',
              delivery_fee: pkg.delivery_fee,
              payment_mode: paymentMethod === 'cod' ? 'COD' : 'PREPAID'
            }).catch((e: unknown) => console.error('delivery_packages insert error', e))
          } else {
            toast.error('Failed to create delivery package')
          }
        } catch (err) {
          console.error('Package creation error', err)
          toast.error('Error creating delivery package')
        }
      }
    }

    // 3. Handle payment
    if (paymentMethod === 'mpesa') {
      try {
        const shippingFee = (shippingMethod === 'pickup' || shippingMethod === 'doorstep') ? (deliveryCharge || 0) : 250
        const totalWithShipping = totalPrice + shippingFee

        const stkRes = await fetch('/api/payments/stk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalWithShipping,
            phoneNumber: phoneNumber,
            reference: orderId,
            description: `Order ${orderId}`
          })
        })

        if (stkRes.ok) {
          const stkData = await stkRes.json()
          toast.success('M-Pesa payment prompt sent to your phone')
          console.log('STK Push initiated:', stkData)
        } else {
          const errData = await stkRes.json()
          toast.error(errData.error || 'Failed to initiate M-Pesa payment')
        }
      } catch (e) {
        console.error('Mpesa initiation failed', e)
        toast.error('Failed to initiate M-Pesa payment')
      }
    } else {
      toast.success('Order placed! Pay on delivery.')
    }

    // 4. Update order status to processing
    if (orderId) {
      try {
        const supabase = createBrowserSupabase()
        await supabase.from('orders').update({ status: 'processing' }).eq('id', orderId)
      } catch (e) {
        console.error('Failed to update order status', e)
      }
    }

    setIsLoading(false)
    setIsSuccess(true)
    clearCart()
  }

  if (isSuccess) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 rounded-full bg-blue-500/10 p-6">
          <CheckCircle2 className="h-16 w-16 text-blue-600" />
        </div>
        <h1 className="text-4xl font-heading font-bold text-foreground">Order Confirmed!</h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          {paymentMethod === "mpesa"
            ? "Thank you for your purchase. You will receive an M-Pesa confirmation shortly."
            : "Thank you for your order. Please have the exact amount ready upon delivery/pickup."}
          <br />
          We&apos;ll start processing your order right away.
        </p>
        <Button asChild className="mt-8 bg-blue-600 hover:bg-blue-700" size="lg">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl font-heading font-bold text-foreground">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add some items to checkout</p>
        <Button asChild className="mt-6 bg-blue-600 hover:bg-blue-700">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-8 text-4xl font-heading font-bold text-foreground">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Contact Information</CardTitle>
              <CardDescription>Enter your details for delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="07XX XXX XXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Shipping Method</CardTitle>
              <CardDescription>Choose how you want to receive your order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={shippingMethod}
                onValueChange={(value: "pickup" | "doorstep") => setShippingMethod(value)}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="pickup" id="pickup" className="peer sr-only" />
                  <Label
                    htmlFor="pickup"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary h-full"
                  >
                    <MapPin className="mb-3 h-6 w-6" />
                    Pickup Station
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="doorstep" id="doorstep" className="peer sr-only" />
                  <Label
                    htmlFor="doorstep"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary h-full"
                  >
                    <Home className="mb-3 h-6 w-6" />
                    Door Delivery
                  </Label>
                </div>
              </RadioGroup>

              {shippingMethod === "pickup" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label>Area / Region</Label>
                    <Select value={selectedArea} onValueChange={(val) => {
                      setSelectedArea(val)
                      setPickupLocation('')
                      setPickupAgent('')
                      setAgents([])
                      // Fetch pickup locations for selected area
                      if (val) {
                        setLocationsLoading(true)
                        fetch(`/api/pickup-mtaani/locations?areaId=${val}`)
                          .then(res => res.json())
                          .then(data => {
                            // Ensure we always set an array and extract from data.data if needed
                            const locs = Array.isArray(data) ? data : (data.data || data.locations || [])
                            setLocations(locs)
                            setLocationsLoading(false)
                          })
                          .catch(e => {
                            console.error('Failed to fetch pickup locations', e)
                            toast.error('Failed to load pickup locations')
                            setLocations([])
                            setLocationsLoading(false)
                          })
                      } else {
                        setLocations([])
                      }
                    }} disabled={locationsLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder={locationsLoading ? "Loading areas..." : "Select Area"} />
                      </SelectTrigger>
                      <SelectContent>
                        {areas.map(area => (
                          <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pickupLocation">Select Pickup Location</Label>
                    <Select value={pickupLocation} onValueChange={(val) => {
                      setPickupLocation(val)
                      setPickupAgent('')
                      setAgents([])

                      if (val) {
                        setAgentsLoading(true)
                        fetch(`/api/pickup-mtaani/agents?locationId=${val}`)
                          .then(res => res.json())
                          .then(data => {
                            const agentsList = Array.isArray(data) ? data : (data.data || [])
                            setAgents(agentsList)
                            setAgentsLoading(false)
                          })
                          .catch(e => {
                            console.error('Failed to fetch agents', e)
                            toast.error('Failed to load agents')
                            setAgents([])
                            setAgentsLoading(false)
                          })
                      }
                    }} disabled={!selectedArea || locationsLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder={locationsLoading ? "Loading locations..." : (!selectedArea ? "Select an area first" : "Select a location")} />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.name} {loc.town ? `(${loc.town})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pickupAgent">Select Pickup Agent</Label>
                    <Select value={pickupAgent} onValueChange={setPickupAgent} disabled={!pickupLocation || agentsLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder={agentsLoading ? "Loading agents..." : (!pickupLocation ? "Select a location first" : "Select an agent")} />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.business_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {shippingMethod === "doorstep" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label>Area / Region</Label>
                    <Select value={selectedArea} onValueChange={(val) => {
                      setSelectedArea(val)
                      setDoorstepLocation('')
                      // Fetch doorstep destinations for selected area
                      if (val) {
                        setDoorstepLoading(true)
                        fetch(`/api/pickup-mtaani/doorstep-destinations?areaId=${val}`)
                          .then(res => res.json())
                          .then(data => {
                            // Ensure we always set an array
                            const destinations = Array.isArray(data) ? data : (data.data || [])
                            setDoorstepDestinations(destinations)
                            setDoorstepLoading(false)

                            // Show info toast if no destinations available
                            if (destinations.length === 0) {
                              toast.info('Door delivery not available in this area')
                            }
                          })
                          .catch(e => {
                            console.error('Failed to fetch doorstep destinations', e)
                            toast.error('Failed to load doorstep destinations')
                            setDoorstepDestinations([])
                            setDoorstepLoading(false)
                          })
                      } else {
                        setDoorstepDestinations([])
                      }
                    }} disabled={locationsLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder={locationsLoading ? "Loading areas..." : "Select Area"} />
                      </SelectTrigger>
                      <SelectContent>
                        {areas.map(area => (
                          <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doorstepLocation">Select Doorstep Destination</Label>
                    <Select value={doorstepLocation} onValueChange={setDoorstepLocation} disabled={!selectedArea || doorstepLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder={doorstepLoading ? "Loading..." : "Select a destination"} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(doorstepDestinations) && doorstepDestinations.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Specific Address Details</Label>
                    <Input
                      id="address"
                      placeholder="House No, Street, Landmark"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {(shippingMethod === 'pickup' || shippingMethod === 'doorstep') && deliveryCharge !== null && (
                <div className="rounded-lg bg-secondary/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Delivery Fee</span>
                    </div>
                    <span className="font-bold">KES {deliveryCharge}</span>
                  </div>
                </div>
              )}

              {deliveryChargeLoading && (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Calculating fee...</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Payment Method</CardTitle>
              <CardDescription>Select your preferred payment option</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-6">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value: "mpesa" | "cod") => setPaymentMethod(value)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="mpesa" id="mpesa" className="peer sr-only" />
                    <Label
                      htmlFor="mpesa"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Smartphone className="mb-3 h-6 w-6" />
                      M-Pesa
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="cod" id="cod" className="peer sr-only" />
                    <Label
                      htmlFor="cod"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Banknote className="mb-3 h-6 w-6" />
                      Pay on Delivery
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "mpesa" && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-16 items-center justify-center rounded bg-white p-1">
                        <span className="text-xs font-bold text-green-600">M-PESA</span>
                      </div>
                      <div>
                        <p className="font-medium">M-Pesa Express</p>
                        <p className="text-xs text-muted-foreground">Instant payment to your phone</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      We will send a payment prompt to <strong>{phoneNumber || "your phone number"}</strong>.
                    </p>
                  </div>
                )}

                {paymentMethod === "cod" && (
                  <div className="rounded-lg border border-muted bg-muted/50 p-4 animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm text-muted-foreground">
                      You will pay for your order when it is delivered or when you pick it up.
                      Please ensure you have the exact amount or M-Pesa ready.
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-24 rounded-2xl border-border bg-secondary/10">
            <CardHeader>
              <CardTitle className="text-foreground">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.quantity}x {item.name}
                    </span>
                    <span>
                      {new Intl.NumberFormat('en-KE', {
                        style: 'currency',
                        currency: 'KES',
                        minimumFractionDigits: 0,
                      }).format(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span>{formattedTotal}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                <span>
                  {deliveryChargeLoading ? 'Calculating...' : (deliveryCharge !== null ? `KES ${deliveryCharge}` : '—')}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold text-blue-600">
                <span>Total</span>
                <span>
                  {new Intl.NumberFormat('en-KE', {
                    style: 'currency',
                    currency: 'KES',
                    minimumFractionDigits: 0,
                  }).format(totalPrice + (deliveryCharge || 0))}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
                onClick={handlePayment}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  paymentMethod === "mpesa" ? `Pay Now` : `Place Order`
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
