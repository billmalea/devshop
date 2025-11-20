'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/client'
import {
  Menu, X, LayoutDashboard, Users, Package, ShoppingCart,
  Truck, BarChart3, Tag, FileText, Settings, LogOut, Folder
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (!authUser) {
          router.push('/auth/login?next=/admin')
          return
        }

        const { data: adminUser, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', authUser.id)
          .eq('is_active', true)
          .maybeSingle()

        if (error || !adminUser) {
          router.push('/')
          return
        }

        setUser(authUser)
        setIsAdmin(true)
      } catch (error) {
        console.error('Admin access check failed:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    checkAdminAccess()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: Folder },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Deliveries', href: '/admin/deliveries', icon: Truck },
    { label: 'Inventory', href: '/admin/inventory', icon: BarChart3 },
    { label: 'Promotions', href: '/admin/promotions', icon: Tag },
    { label: 'Content', href: '/admin/content', icon: FileText },
    { label: 'Reports', href: '/admin/reports', icon: FileText },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-background border-r border-border transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-border">
          {sidebarOpen && (
            <Link href="/admin" className="flex items-center gap-2 font-heading font-bold text-xl">
              <span className="text-foreground">DevShop</span>
              <span className="text-blue-600">.</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                  ? 'bg-blue-500/10 text-blue-600 font-medium'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          {sidebarOpen && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1">Signed in as</p>
              <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
            </div>
          )}
          <Button
            asChild
            variant="ghost"
            size={sidebarOpen ? "default" : "icon"}
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <Link href="/auth/logout">
              <LogOut size={20} />
              {sidebarOpen && <span className="ml-3">Logout</span>}
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-background border-b border-border px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-heading font-bold text-foreground">Admin Panel</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage your DevShop store</p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/">View Store</Link>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-secondary/20">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
