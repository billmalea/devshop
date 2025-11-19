"use client"

import Link from "next/link"
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ProductFiltersProps {
  currentCategory?: string
  currentBrand?: string
}

const categories = [
  { value: 'hoodies', label: 'Hoodies' },
  { value: 'stickers', label: 'Stickers' },
  { value: 'sweatshirts', label: 'Sweatshirts' },
  { value: 'headbands', label: 'Headbands' },
]

const brands = [
  'Amazon',
  'AWS',
  'Vercel',
  'Anthropic',
  'Google',
  'Microsoft',
  'Uber',
]

export function ProductFilters({ currentCategory, currentBrand }: ProductFiltersProps) {
  const searchParams = useSearchParams()

  const buildUrl = (type: 'category' | 'brand', value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (type === 'category') {
      if (currentCategory === value) {
        params.delete('category')
      } else {
        params.set('category', value)
      }
    } else {
      if (currentBrand === value) {
        params.delete('brand')
      } else {
        params.set('brand', value)
      }
    }
    
    return `/products?${params.toString()}`
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-base">Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link
            href="/products"
            className={cn(
              "block rounded-md px-3 py-2 text-sm transition-colors hover:bg-secondary",
              !currentCategory && "bg-primary/10 text-primary font-medium"
            )}
          >
            All Categories
          </Link>
          {categories.map((category) => (
            <Link
              key={category.value}
              href={buildUrl('category', category.value)}
              className={cn(
                "block rounded-md px-3 py-2 text-sm transition-colors hover:bg-secondary",
                currentCategory === category.value && "bg-primary/10 text-primary font-medium"
              )}
            >
              {category.label}
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-base">Brands</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {brands.map((brand) => (
            <Link key={brand} href={buildUrl('brand', brand)}>
              <Badge
                variant={currentBrand === brand ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground",
                  currentBrand === brand && "bg-primary text-primary-foreground"
                )}
              >
                {brand}
              </Badge>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
