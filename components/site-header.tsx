import Link from "next/link"
import { Search, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CartSheet } from "@/components/cart-sheet"
import { createClient } from "@/lib/server"
import { UserDropdown } from "@/components/user-dropdown"

export async function SiteHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white shadow-sm border-t-4 border-t-primary">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
            <span className="text-primary">&lt;</span>
            <span className="text-foreground">DevShop</span>
            <span className="text-primary">/&gt;</span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
            <Link href="/products" className="text-muted-foreground transition-colors hover:text-primary hover:font-semibold">
              All Products
            </Link>
            <Link href="/products?category=hoodies" className="text-muted-foreground transition-colors hover:text-primary hover:font-semibold">
              Hoodies
            </Link>
            <Link href="/products?category=stickers" className="text-muted-foreground transition-colors hover:text-primary hover:font-semibold">
              Stickers
            </Link>
            <Link href="/products?category=accessories" className="text-muted-foreground transition-colors hover:text-primary hover:font-semibold">
              Accessories
            </Link>
            <Link href="/products?category=sweatshirts" className="text-muted-foreground transition-colors hover:text-primary hover:font-semibold">
              Sweatshirts
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex relative w-full max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-9 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary rounded-full"
            />
          </div>
          
          <CartSheet />
          
          {user ? (
            <UserDropdown user={user} />
          ) : (
            <Button asChild variant="ghost" size="icon" className="text-foreground hover:bg-secondary hover:text-primary">
              <Link href="/auth/login">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
