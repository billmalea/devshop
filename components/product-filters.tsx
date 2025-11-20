'use client'

import { useEffect, useState } from 'react'
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { createClient } from '@/lib/client'

interface ProductFiltersProps {
  currentCategory?: string
  currentBrand?: string
}

interface Category {
  id: string
  name: string
  slug: string
  parent_id?: string
}

const brands = [
  'Amazon',
  'AWS',
  'Vercel',
  'Anthropic',
  'Google',
  'Microsoft',
  'Uber',
  'Apple',
  'Meta',
  'Netflix',
  'Tesla',
  'OpenAI',
  'GitHub',
  'Docker',
  'Kubernetes',
  'React',
  'Next.js',
  'TypeScript',
  'Python',
  'JavaScript',
]

// Fallback categories in case database fetch fails
const fallbackCategories = [
  { id: '1', name: 'Apparel', slug: 'apparel' },
  { id: '2', name: 'Accessories', slug: 'accessories' },
  { id: '3', name: 'Drinkware', slug: 'drinkware' },
]

export function ProductFilters({ currentCategory, currentBrand }: ProductFiltersProps) {
  const [categories, setCategories] = useState<Category[]>(fallbackCategories)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .is('parent_id', null) // Only get main categories
        .order('name', { ascending: true })

      if (!error && data) {
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch categories, using fallback:', error)
      // categories already set to fallbackCategories
    } finally {
      setLoading(false)
    }
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
          {loading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">Loading...</div>
          ) : (
            categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors hover:bg-secondary",
                  currentCategory === category.slug && "bg-primary/10 text-primary font-medium"
                )}
              >
                {category.name}
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-base">Brands</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {brands.map((brand) => (
            <Link
              key={brand}
              href={currentBrand === brand ? '/products' : `/products?brand=${brand}`}
            >
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
