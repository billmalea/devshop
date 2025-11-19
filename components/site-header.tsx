
import Link from "next/link"
import { Search, User, Menu, ShoppingBag, Home, Shirt, Sticker, Package } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CartSheet } from "@/components/cart-sheet"
import { createClient } from "@/lib/server"
import { UserDropdown } from "@/components/user-dropdown"
import { ModeToggle } from "@/components/mode-toggle"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

export async function SiteHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const navLinks = [
    { href: "/products", label: "All Products", icon: Package },
    { href: "/products?category=hoodies", label: "Hoodies", icon: Shirt },
    { href: "/products?category=stickers", label: "Stickers", icon: Sticker },
    { href: "/products?category=accessories", label: "Accessories", icon: ShoppingBag },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden mr-2 text-muted-foreground hover:text-foreground">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] pr-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

              <div className="px-2 py-6">
                <Link href="/" className="flex items-center gap-2 font-heading font-bold text-2xl tracking-tight mb-8">
                  <span className="text-foreground">DevShop</span>
                  <span className="text-blue-600">.</span>
                </Link>

                <nav className="flex flex-col gap-2">
                  <Link
                    href="/"
                    className="flex items-center gap-4 px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all"
                  >
                    <Home className="h-5 w-5" />
                    Home
                  </Link>

                  <div className="my-2">
                    <p className="px-4 text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2">Shop</p>
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center gap-4 px-4 py-3 text-lg font-medium text-muted-foreground hover:text-blue-600 hover:bg-blue-500/5 rounded-lg transition-all"
                      >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </nav>

                <div className="absolute bottom-8 left-6 right-6">
                  <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                    <p className="text-sm font-medium mb-1">Need Help?</p>
                    <p className="text-xs text-muted-foreground mb-3">Contact our support team</p>
                    <Button size="sm" className="w-full bg-foreground text-background hover:bg-foreground/90">
                      Contact Support
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group font-heading font-bold text-2xl tracking-tight transition-opacity mr-12 lg:mr-24">
            <span className="text-foreground group-hover:text-foreground/90">DevShop</span>
            <span className="text-blue-600 group-hover:animate-pulse">.</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-10 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-muted-foreground transition-colors hover:text-foreground group py-2"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex relative w-full max-w-xs group">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-blue-600 transition-colors" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full pl-9 bg-secondary/50 border-transparent focus:border-blue-600/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full transition-all duration-300"
            />
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <ModeToggle />
            <CartSheet />

            {user ? (
              <UserDropdown user={user} />
            ) : (
              <Button asChild variant="ghost" size="icon" className="text-foreground hover:bg-secondary hover:text-blue-600 rounded-full">
                <Link href="/auth/login">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Login</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
