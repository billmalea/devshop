import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Package, Truck, Shield, CreditCard, Shirt, Sticker, Code, Cpu, Zap, Keyboard } from 'lucide-react'
import { createClient } from "@/lib/server"
import { ProductCard } from "@/components/product-card"
import Image from 'next/image'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featuredProducts, error } = await supabase
    .from('products')
    .select('*')
    .limit(8)

  const { data: newArrivals } = await supabase
    .from('new_arrivals')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
    .limit(3)

  if (error) {
    console.error("[v0] Error fetching products:", error);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-16 pb-24 md:pt-32 md:pb-48 border-b border-border">
        {/* Ambient Background Glow */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-500/10 blur-[120px] animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-500 backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                New Collection Available
              </div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground leading-[1.1]">
                Elevate Your <br />
                <span className="text-blue-600 dark:text-blue-400">Tech Stack</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                Premium merchandise for developers who ship.
                High-quality gear from the brands you use every day.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/90 font-bold text-base rounded-full px-8 transition-all duration-300">
                  <Link href="/products">
                    Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-8 border-border hover:bg-secondary">
                  <Link href="/products?category=hoodies">
                    View Hoodies
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-4 pt-4 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span>Pay on Delivery</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Secure Payments</span>
                </div>
              </div>
            </div>

            {/* Merged Visuals: Rings + Icons + Cards */}
            <div className="relative h-[500px] lg:h-[700px] w-full flex items-center justify-center mt-12 lg:mt-0">
              {/* Spinning Rings */}
              <div className="absolute inset-0 flex items-center justify-center scale-75 lg:scale-100">
                <div className="w-[500px] h-[500px] border border-foreground/5 rounded-full animate-[spin_30s_linear_infinite]" />
                <div className="absolute w-[350px] h-[350px] border border-blue-500/10 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
                <div className="absolute w-[650px] h-[650px] border border-violet-500/5 rounded-full animate-[spin_40s_linear_infinite]" />
              </div>

              {/* Floating Icons */}
              <div className="absolute top-10 right-10 lg:top-12 lg:right-12 p-3 lg:p-5 bg-background/80 backdrop-blur-md border border-border rounded-2xl shadow-xl animate-[bounce_4s_infinite]">
                <Code className="h-5 w-5 lg:h-8 lg:w-8 text-foreground" />
              </div>
              <div className="absolute top-10 left-10 lg:top-12 lg:left-12 p-3 lg:p-5 bg-background/80 backdrop-blur-md border border-border rounded-2xl shadow-xl animate-[bounce_6s_infinite] delay-300">
                <Zap className="h-5 w-5 lg:h-8 lg:w-8 text-yellow-500" />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 lg:bottom-0 p-3 lg:p-5 bg-background/80 backdrop-blur-md border border-border rounded-2xl shadow-xl animate-[bounce_5s_infinite] delay-700">
                <Cpu className="h-5 w-5 lg:h-8 lg:w-8 text-blue-500" />
              </div>

              {/* New Arrivals Cards Stack */}
              <div className="relative z-10 flex items-center justify-center -space-x-16 lg:-space-x-24 hover:space-x-4 transition-all duration-700 ease-out">
                {newArrivals && newArrivals.length > 0 ? (
                  newArrivals.map((arrival, index) => (
                    <div
                      key={arrival.id}
                      className={`relative aspect-[3/4] w-48 lg:w-72 rounded-2xl overflow-hidden bg-secondary border border-border shadow-2xl transition-all duration-500 ${index === 0 ? '-rotate-12 hover:rotate-0 hover:scale-105 hover:z-20 origin-bottom-right' :
                          index === 1 ? 'z-10 hover:scale-110 hover:z-30 -translate-y-8 lg:-translate-y-16 hidden lg:block' :
                            'rotate-12 hover:rotate-0 hover:scale-105 hover:z-20 origin-bottom-left'
                        }`}
                    >
                      <Image
                        src={arrival.image_url}
                        alt={arrival.title || 'New Arrival'}
                        fill
                        className="object-cover"
                      />
                      {(arrival.title || arrival.description) && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-6 bg-background/90 backdrop-blur-sm border-t border-border">
                          {arrival.title && <p className="font-bold text-sm lg:text-xl">{arrival.title}</p>}
                          {arrival.description && <p className="text-[10px] lg:text-sm text-muted-foreground">{arrival.description}</p>}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  // Fallback to placeholders if no new arrivals
                  <>
                    <div className="relative aspect-[3/4] w-48 lg:w-72 rounded-2xl overflow-hidden bg-secondary border border-border shadow-2xl -rotate-12 hover:rotate-0 hover:scale-105 hover:z-20 transition-all duration-500 origin-bottom-right">
                      <div className="absolute inset-0 flex items-center justify-center bg-muted">
                        <Shirt className="h-16 w-16 lg:h-32 lg:w-32 text-muted-foreground/20" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-6 bg-background/90 backdrop-blur-sm border-t border-border">
                        <p className="font-bold text-sm lg:text-xl">Dev Hoodies</p>
                        <p className="text-[10px] lg:text-sm text-muted-foreground">Premium Cotton</p>
                      </div>
                    </div>
                    <div className="relative hidden lg:block aspect-[3/4] w-48 lg:w-72 rounded-2xl overflow-hidden bg-secondary border border-border shadow-2xl z-10 hover:scale-110 hover:z-30 transition-all duration-500 -translate-y-8 lg:-translate-y-16">
                      <div className="absolute inset-0 flex items-center justify-center bg-muted">
                        <Keyboard className="h-16 w-16 lg:h-32 lg:w-32 text-muted-foreground/20" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-6 bg-background/90 backdrop-blur-sm border-t border-border">
                        <p className="font-bold text-sm lg:text-xl">Mech Keys</p>
                        <p className="text-[10px] lg:text-sm text-muted-foreground">Tactile Switches</p>
                      </div>
                    </div>
                    <div className="relative aspect-[3/4] w-48 lg:w-72 rounded-2xl overflow-hidden bg-secondary border border-border shadow-2xl rotate-12 hover:rotate-0 hover:scale-105 hover:z-20 transition-all duration-500 origin-bottom-left">
                      <div className="absolute inset-0 flex items-center justify-center bg-muted">
                        <Sticker className="h-16 w-16 lg:h-32 lg:w-32 text-muted-foreground/20" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-6 bg-background/90 backdrop-blur-sm border-t border-border">
                        <p className="font-bold text-sm lg:text-xl">Laptop Stickers</p>
                        <p className="text-[10px] lg:text-sm text-muted-foreground">Die-cut Vinyl</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="p-8 flex flex-col items-center text-center gap-4 hover:bg-secondary/40 transition-colors">
              <div className="p-4 bg-secondary rounded-full text-foreground">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Premium Quality</h3>
                <p className="text-sm text-muted-foreground mt-1">Official merchandise from top tech brands</p>
              </div>
            </div>
            <div className="p-8 flex flex-col items-center text-center gap-4 hover:bg-secondary/40 transition-colors">
              <div className="p-4 bg-secondary rounded-full text-foreground">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Fast Delivery</h3>
                <p className="text-sm text-muted-foreground mt-1">Countrywide shipping to your doorstep</p>
              </div>
            </div>
            <div className="p-8 flex flex-col items-center text-center gap-4 hover:bg-secondary/40 transition-colors">
              <div className="p-4 bg-secondary rounded-full text-foreground">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Secure Payments</h3>
                <p className="text-sm text-muted-foreground mt-1">Safe transactions via M-Pesa & Cards</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Featured Products</h2>
              <p className="mt-2 text-muted-foreground text-lg">
                Explore our most popular developer merchandise
              </p>
            </div>
            <Button asChild variant="ghost" className="text-foreground hover:bg-secondary">
              <Link href="/products">
                View All Products <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts && featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 border border-dashed border-border rounded-xl bg-secondary/20">
                <p className="text-muted-foreground">No products found. Please check back later.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Brands Grid */}
      <section className="border-t border-border py-24 bg-secondary/10">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-2xl font-bold tracking-tight text-muted-foreground">
            Trusted Brands
          </h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {['Amazon', 'AWS', 'Vercel', 'Anthropic', 'Google', 'Microsoft', 'Uber'].map((brand) => (
              <Link
                key={brand}
                href={`/products?brand=${brand}`}
                className="text-xl font-bold text-foreground hover:text-foreground transition-colors"
              >
                {brand}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
