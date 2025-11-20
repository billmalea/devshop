'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/client'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Category {
    id: string
    name: string
    slug: string
    description?: string
    parent_id?: string
}

interface Product {
    id: string
    name: string
    slug?: string
    price: number
    image_url?: string
    category: string
    brand: string
}

export default function ShopPage() {
    const params = useParams()
    const categorySlug = params.category as string
    const subcategorySlug = params.subcategory as string

    const [category, setCategory] = useState<Category | null>(null)
    const [subcategory, setSubcategory] = useState<Category | null>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [categorySlug, subcategorySlug])

    const fetchData = async () => {
        setLoading(true)
        try {
            const supabase = createClient()

            // Fetch category
            if (categorySlug) {
                const { data: catData } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('slug', categorySlug)
                    .single()

                setCategory(catData)

                // Fetch subcategory if exists
                if (subcategorySlug && catData) {
                    const { data: subcatData } = await supabase
                        .from('categories')
                        .select('*')
                        .eq('slug', subcategorySlug)
                        .eq('parent_id', catData.id)
                        .single()

                    setSubcategory(subcatData)
                }
            }

            // Fetch products
            let query = supabase
                .from('products')
                .select('*')
                .eq('is_active', true)

            if (subcategorySlug) {
                query = query.ilike('category', `%${subcategorySlug}%`)
            } else if (categorySlug) {
                query = query.ilike('category', `%${categorySlug}%`)
            }

            const { data: productsData } = await query.order('created_at', { ascending: false })
            setProducts(productsData || [])
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="text-center">Loading...</div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Link href="/" className="hover:text-foreground">Home</Link>
                <ChevronRight size={16} />
                <Link href="/shop" className="hover:text-foreground">Shop</Link>
                {category && (
                    <>
                        <ChevronRight size={16} />
                        <Link href={`/shop/${category.slug}`} className="hover:text-foreground">
                            {category.name}
                        </Link>
                    </>
                )}
                {subcategory && (
                    <>
                        <ChevronRight size={16} />
                        <span className="text-foreground font-medium">{subcategory.name}</span>
                    </>
                )}
            </nav>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-heading font-bold mb-2">
                    {subcategory?.name || category?.name || 'All Products'}
                </h1>
                {(subcategory?.description || category?.description) && (
                    <p className="text-muted-foreground">
                        {subcategory?.description || category?.description}
                    </p>
                )}
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/products/${product.slug || product.id}`}
                            className="group bg-background border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                        >
                            <div className="aspect-square bg-secondary/20 relative overflow-hidden">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-heading font-bold text-lg mb-1 group-hover:text-blue-600 transition-colors">
                                    {product.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
                                <p className="text-lg font-bold text-blue-600">
                                    KSh {product.price.toLocaleString()}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No products found in this category.</p>
                </div>
            )}
        </div>
    )
}
