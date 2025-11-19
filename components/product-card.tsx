"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from 'lucide-react'
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
    <Card className="group overflow-hidden border-border bg-card text-card-foreground transition-all hover:shadow-lg hover:border-primary/50 duration-300">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-4/3 overflow-hidden bg-secondary">
          <Image
            src={product.image_url || '/placeholder.svg?height=400&width=400&query=developer%20merchandise'}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-110 duration-300"
          />
          <Badge className="absolute right-3 top-3 bg-primary text-primary-foreground font-semibold shadow-md">
            {product.brand}
          </Badge>
        </div>
      </Link>
      
      <CardContent className="p-4 space-y-2">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-primary">{formattedPrice}</span>
          <span className="text-xs text-muted-foreground font-medium">
            {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium" 
          disabled={product.stock === 0}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}
