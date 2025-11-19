import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Package, Truck, Shield } from 'lucide-react'
import { createClient } from "@/lib/server"
import { ProductCard } from "@/components/product-card"
import Image from 'next/image'

export default async function HomePage() {
  const supabase = await createClient()
  
  const { data: featuredProducts, error } = await supabase
    .from('products')
    .select('*')
    .limit(8)

  if (error) {
    console.error("[v0] Error fetching products:", error);
  }

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border bg-linear-to-b from-white to-secondary/20">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left side: Text content */}
            <div>
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-6">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                Now Shipping to Nairobi & Environs
              </div>
              <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl text-balance text-foreground mb-6">
                Premium Developer Merch in Kenya
              </h1>
              
              <p className="text-lg text-foreground/70 text-balance leading-relaxed mb-8">
                Wear your code. Celebrate your tech stack. 
                Exclusive hoodies, stickers, and gear from Amazon, AWS, Vercel, Google, and more.
                Delivered to your doorstep.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-base font-semibold shadow-lg shadow-primary/20">
                  <Link href="/products">
                    Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base">
                  <Link href="/products?category=hoodies">
                    Browse Hoodies
                  </Link>
                </Button>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-border shadow-sm">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-foreground">Fast Delivery</span>
                    <span className="text-xs text-muted-foreground">Countrywide Shipping</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-border shadow-sm">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-foreground">Secure Payment</span>
                    <span className="text-xs text-muted-foreground">M-Pesa & Cards</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Featured product cards */}
            <div className="grid grid-cols-2 gap-4 auto-rows-max">
              {featuredProducts && featuredProducts.slice(0, 4).map((product) => (
                <Link 
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group overflow-hidden rounded-xl border border-border bg-white hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="relative aspect-4/3 bg-secondary overflow-hidden">
                    <Image
                      src={product.image_url || `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(product.brand + ' ' + product.category)}`}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-primary mb-1">{product.brand}</p>
                    <p className="text-sm font-bold text-foreground line-clamp-1">{product.name}</p>
                    <p className="text-sm font-bold text-foreground mt-1">KES {product.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-start space-y-3 p-6 rounded-2xl bg-secondary/30 border border-border/50">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Premium Quality</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                High-quality materials and vibrant prints that last. Sourced directly from official merchandise stores.
              </p>
            </div>
            <div className="flex flex-col items-start space-y-3 p-6 rounded-2xl bg-secondary/30 border border-border/50">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Fast Delivery</h3>
              <p className="text-sm text-foreground/60 leading-relaxed">
                Quick delivery across Kenya via M-Pesa or Pickup Mtaani
              </p>
            </div>
            <div className="flex flex-col items-start space-y-3 p-6 rounded-2xl bg-secondary/30 border border-border/50">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Secure Payments</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Safe and easy mobile & card payments via M-Pesa.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-4xl font-bold tracking-tighter text-foreground">Featured Products</h2>
              <p className="mt-3 text-foreground/60 text-lg">
                Explore our most popular developer merchandise
              </p>
            </div>
            <Button asChild variant="outline" className="hidden md:flex border-black/20 hover:bg-black/5">
              <Link href="/products">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts && featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-foreground/60">No products available yet. Please run the database seed scripts.</p>
              </div>
            )}
          </div>

          <div className="mt-10 text-center md:hidden">
            <Button asChild variant="outline">
              <Link href="/products">
                View All Products <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-b border-border bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter text-foreground">
            Shop by Brand
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-7">
            {['Amazon', 'AWS', 'Vercel', 'Anthropic', 'Google', 'Microsoft', 'Uber'].map((brand) => (
              <Link
                key={brand}
                href={`/products?brand=${brand}`}
                className="flex items-center justify-center rounded-lg border border-black/10 bg-white p-6 transition-all hover:border-black hover:shadow-md hover:bg-black hover:text-white duration-300 font-semibold"
              >
                <span>{brand}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
