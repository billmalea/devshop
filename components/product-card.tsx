"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Minus, Plus } from 'lucide-react'
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

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, items, updateQuantity } = useCart()
  const cartItem = items.find((item) => item.id === product.id)
  const quantity = cartItem ? cartItem.quantity : 0

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
    <Card className="group overflow-hidden border-border bg-card text-card-foreground rounded-xl hover:border-foreground/20 transition-all duration-300 hover:shadow-lg">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-4/3 overflow-hidden bg-secondary/50 group-hover:bg-secondary/30 transition-colors">
          <Image
            src={product.image_url || '/placeholder.svg?height=400&width=400&query=developer%20merchandise'}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105 duration-500 grayscale group-hover:grayscale-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <Badge className="absolute right-3 top-3 bg-background/80 backdrop-blur-sm text-foreground border-border font-medium text-xs rounded-full shadow-sm">
            {product.brand}
          </Badge>
        </div>
      </Link>

      <CardContent className="p-5 space-y-3">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-bold text-lg text-foreground leading-snug group-hover:underline decoration-2 underline-offset-4 transition-all line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {product.description || "No description available"}
        </p>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-foreground' : 'bg-muted-foreground'}`} />
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 flex items-center justify-between gap-3">
        <div className="font-heading font-bold text-lg text-foreground">
          {formattedPrice}
        </div>
        {quantity > 0 ? (
          <div className="flex items-center gap-2 bg-secondary/50 rounded-full px-1 py-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-background"
              onClick={(e) => {
                e.preventDefault()
                updateQuantity(product.id, quantity - 1)
              }}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="font-bold text-sm w-4 text-center">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-background"
              onClick={(e) => {
                e.preventDefault()
                if (product.stock > quantity) {
                  updateQuantity(product.id, quantity + 1)
                }
              }}
              disabled={quantity >= product.stock}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button
            className="bg-foreground text-background hover:bg-foreground/90 font-medium text-sm rounded-full px-6"
            disabled={product.stock === 0}
            onClick={(e) => {
              e.preventDefault()
              handleAddToCart()
            }}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
