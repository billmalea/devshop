import { redirect } from 'next/navigation'
import { createClient } from "@/lib/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, User, LogOut } from 'lucide-react'
import { SignOutButton } from "@/components/sign-out-button"

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <Card className="border-border/40">
            <CardContent className="flex flex-col items-center p-6">
              <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage src={user.user_metadata.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl bg-secondary">
                  {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-bold">{profile?.full_name || 'User'}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              
              <div className="mt-6 w-full">
                <SignOutButton />
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
              <TabsTrigger value="orders">My Orders</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="orders" className="mt-6 space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Order History</h2>
              {orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="border-border/40">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                          <CardTitle className="text-base">Order #{order.id.slice(0, 8)}</CardTitle>
                          <CardDescription>
                            {new Date(order.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-primary">
                            {new Intl.NumberFormat('en-KE', {
                              style: 'currency',
                              currency: 'KES',
                              minimumFractionDigits: 0,
                            }).format(order.total_amount)}
                          </span>
                          <span className="text-xs capitalize text-muted-foreground">
                            {order.status}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mt-2 space-y-2">
                          {order.order_items.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {item.quantity}x {item.products.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-border/40">
                  <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <Package className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No orders yet</p>
                    <p className="text-sm text-muted-foreground">
                      Start shopping to see your orders here
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="settings" className="mt-6">
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" defaultValue={profile?.full_name || ''} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue={user.email} disabled />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue={profile?.phone_number || ''} placeholder="07XX XXX XXX" />
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
