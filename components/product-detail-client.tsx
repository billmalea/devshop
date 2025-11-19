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
    <div className="container mx-auto px-4 py-12 lg:py-20">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-start">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-secondary/50 shadow-2xl">
          <Image
            src={product.image_url || '/placeholder.svg?height=600&width=600&query=developer%20merchandise'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            priority
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 px-3 py-1 text-sm font-medium rounded-full">
                {product.brand}
              </Badge>
              <Badge variant="outline" className="bg-secondary text-muted-foreground border-border px-3 py-1 text-sm font-medium rounded-full">
                {product.category}
              </Badge>
            </div>

            <h1 className="text-4xl lg:text-5xl font-heading font-bold tracking-tight text-foreground leading-tight">
              {product.name}
            </h1>

            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formattedPrice}
            </p>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {product.description || 'Premium developer merchandise designed for comfort and style. Made with high-quality materials suitable for long coding sessions.'}
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm font-medium p-4 bg-secondary/30 rounded-xl border border-border/50">
            <div className={`h-2.5 w-2.5 rounded-full ${product.stock > 0 ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-foreground">
              {product.stock > 0 ? "In Stock" : "Out of Stock"}
            </span>
            <span className="text-muted-foreground mx-2">•</span>
            <span className="text-muted-foreground">
              {product.stock > 0 ? `Ready to ship` : 'Restocking soon'}
            </span>
          </div>

          <div className="pt-4">
            <Button
              size="lg"
              className="w-full h-14 text-lg bg-foreground text-background hover:bg-foreground/90 font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={product.stock === 0}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>

          <div className="grid gap-6 pt-8 border-t border-border">
            <div className="flex items-start gap-4 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">Premium Quality</h3>
                <p className="text-muted-foreground mt-1 leading-relaxed">
                  Crafted with top-tier materials for durability and comfort.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 group-hover:bg-violet-500 group-hover:text-white transition-colors duration-300">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">Fast Delivery</h3>
                <p className="text-muted-foreground mt-1 leading-relaxed">
                  Shipping across Kenya within 2-4 business days.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-600 group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">Secure Checkout</h3>
                <p className="text-muted-foreground mt-1 leading-relaxed">
                  Protected payments via M-Pesa and card.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
