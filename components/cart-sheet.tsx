"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/components/cart-provider"

export function CartSheet() {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    totalPrice, 
    totalItems,
    isCartOpen,
    setIsCartOpen
  } = useCart()

  const formattedTotal = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(totalPrice)

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:text-primary">
          <ShoppingCart className="h-5 w-5" />
          <span className="sr-only">Cart</span>
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-1">
          <SheetTitle>My Cart ({totalItems})</SheetTitle>
        </SheetHeader>
        
        {items.length > 0 ? (
          <>
            <ScrollArea className="flex-1 pr-6">
              <div className="flex flex-col gap-5 pt-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-md border border-border/40 bg-secondary/20">
                      <Image
                        src={item.image_url || '/placeholder.svg?height=100&width=100'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between gap-2">
                        <div>
                          <h3 className="font-medium leading-none">{item.name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{item.brand}</p>
                        </div>
                        <p className="font-medium">
                          {new Intl.NumberFormat('en-KE', {
                            style: 'currency',
                            currency: 'KES',
                            minimumFractionDigits: 0,
                          }).format(item.price * item.quantity)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-4 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="space-y-4 pr-6 pt-4">
              <Separator />
              <div className="flex items-center justify-between text-base font-medium">
                <span>Total</span>
                <span className="text-primary">{formattedTotal}</span>
              </div>
              <SheetFooter>
                <Button asChild className="w-full" size="lg">
                  <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
                    Checkout with M-Pesa <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </SheetFooter>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center space-y-4 pr-6">
            <div className="rounded-full bg-secondary/50 p-6">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground">
                Add some awesome developer swag to get started.
              </p>
            </div>
            <Button asChild variant="outline" onClick={() => setIsCartOpen(false)}>
              <Link href="/products">
                Browse Products
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
