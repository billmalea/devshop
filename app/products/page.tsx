import { createClient } from "@/lib/server"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"
import { MobileFilters } from "@/components/mobile-filters"
import { SubcategoryTabs } from "@/components/subcategory-tabs"

interface SearchParams {
  category?: string
  subcategory?: string
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

  // Fetch subcategories if category is selected
  let subcategories: any[] = []
  if (params.category) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', params.category)
      .single()

    if (categoryData) {
      const { data: subcatsData } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', categoryData.id)
        .order('name', { ascending: true })

      subcategories = subcatsData || []
    }
  }

  // Build query based on filters
  let query = supabase.from('products').select('*')

  if (params.subcategory) {
    query = query.ilike('category', `%${params.subcategory}%`)
  } else if (params.category) {
    query = query.ilike('category', `%${params.category}%`)
  }

  if (params.brand) {
    query = query.ilike('brand', `%${params.brand}%`)
  }

  if (params.search) {
    query = query.ilike('name', `%${params.search}%`)
  }

  const { data: products } = await query.order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tighter lg:text-4xl">
          {params.subcategory
            ? `${params.subcategory.charAt(0).toUpperCase() + params.subcategory.slice(1)}`
            : params.category
              ? `${params.category.charAt(0).toUpperCase() + params.category.slice(1)}`
              : params.brand
                ? `${params.brand} Merchandise`
                : 'All Products'}
        </h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">
          {products?.length || 0} products available
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:w-64 flex-shrink-0">
          <ProductFilters
            currentCategory={params.category}
            currentBrand={params.brand}
          />
        </aside>

        {/* Mobile Filters Button */}
        <div className="lg:hidden">
          <MobileFilters
            currentCategory={params.category}
            currentBrand={params.brand}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Subcategory Tabs */}
          {subcategories.length > 0 && (
            <SubcategoryTabs
              subcategories={subcategories}
              currentSubcategory={params.subcategory}
              currentCategory={params.category!}
            />
          )}

          {/* Products Grid */}
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[300px] md:min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-base md:text-lg font-medium">No products found</p>
              <p className="mt-2 text-xs md:text-sm text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
