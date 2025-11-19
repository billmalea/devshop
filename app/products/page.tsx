import { createClient } from "@/lib/server"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"

interface SearchParams {
  category?: string
  brand?: string
  search?: string
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()
  
  // Build query based on filters
  let query = supabase.from('products').select('*')
  
  if (params.category) {
    query = query.eq('category', params.category)
  }
  
  if (params.brand) {
    query = query.eq('brand', params.brand)
  }
  
  if (params.search) {
    query = query.ilike('name', `%${params.search}%`)
  }
  
  const { data: products } = await query.order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tighter md:text-4xl">
          {params.category 
            ? `${params.category.charAt(0).toUpperCase() + params.category.slice(1)}`
            : params.brand
            ? `${params.brand} Merchandise`
            : 'All Products'}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {products?.length || 0} products available
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-64">
          <ProductFilters 
            currentCategory={params.category}
            currentBrand={params.brand}
          />
        </aside>

        <div className="flex-1">
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-lg font-medium">No products found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
