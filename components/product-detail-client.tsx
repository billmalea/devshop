"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Package, Truck, Shield } from 'lucide-react'
import { useCart } from "@/components/cart-provider"

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  brand: string
  image_url: string | null
  stock: number
}

export function ProductDetailClient({ product }: { product: Product }) {
  const { addItem } = useCart()

  const formattedPrice = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(product.price)

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      brand: product.brand
    })
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-secondary shadow-sm">
          <Image
            src={product.image_url || '/placeholder.svg?height=600&width=600&query=developer%20merchandise'}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="flex flex-col">
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary">{product.brand}</Badge>
            <Badge variant="outline" className="bg-secondary text-foreground border-border">{product.category}</Badge>
          </div>

          <h1 className="text-3xl font-bold tracking-tighter text-foreground md:text-4xl">
            {product.name}
          </h1>

          <p className="mt-4 text-3xl font-bold text-primary">
            {formattedPrice}
          </p>

          <p className="mt-6 text-foreground/80 leading-relaxed text-lg">
            {product.description || 'Premium developer merchandise from a top tech company.'}
          </p>

          <div className="mt-6 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Availability:</span>
            <span className={product.stock > 0 ? "text-primary font-semibold" : "text-destructive font-semibold"}>
              {product.stock > 0 ? `${product.stock} items in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="mt-8 space-y-3">
            <Button 
              size="lg" 
              className="w-full text-base bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              disabled={product.stock === 0}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>

          <div className="mt-12 grid gap-4 border-t border-border pt-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Premium Quality</p>
                <p className="text-sm text-muted-foreground mt-1">
                  High-quality materials and vibrant prints
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Fast Delivery</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Delivered across Kenya within 3-5 days
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Secure Payment</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Safe M-Pesa and multiple payment options
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
