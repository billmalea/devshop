import { notFound } from 'next/navigation'
import Image from "next/image"
import { createClient } from "@/lib/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Package, Truck, Shield } from 'lucide-react'
import { ProductDetailClient } from "@/components/product-detail-client"

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) {
    notFound()
  }

  return <ProductDetailClient product={product} />
}
