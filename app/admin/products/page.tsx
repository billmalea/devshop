'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { Trash2, Edit2, Search, Plus, Sparkles, Image as ImageIcon, Grid3x3, List, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  slug?: string
  description?: string
  short_description?: string
  long_description?: string
  price: number
  category: string
  main_category?: string
  sub_category?: string
  brand: string
  image_url?: string
  stock: number
  sku?: string
  tags?: string[]
  colors?: string[]
  sizes?: string[]
  weight_kg?: number
  dimensions_cm?: string
  is_featured?: boolean
  is_active?: boolean
  discount_percentage?: number
  ai_generated_image?: boolean
  ai_generated_description?: boolean
  meta_title?: string
  meta_description?: string
  created_at?: string
  updated_at?: string
}

// Collapsible Section Component
const FormSection = ({
  title,
  children,
  defaultOpen = true
}: {
  title: string,
  children: React.ReactNode,
  defaultOpen?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-border pb-6 last:border-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 text-left group"
      >
        <h3 className="font-semibold text-foreground group-hover:text-blue-500 transition-colors">{title}</h3>
        {isOpen ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
      </button>

      <div className={cn(
        "grid transition-all duration-300 ease-in-out overflow-hidden",
        isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
      )}>
        <div className="min-h-0">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 50
  const [generatingAI, setGeneratingAI] = useState(false)
  const [showPromptInputs, setShowPromptInputs] = useState(false)
  const [descriptionPrompt, setDescriptionPrompt] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  const [formData, setFormData] = useState({
    name: '',
    short_description: '',
    long_description: '',
    price: '',
    category: '',
    main_category: 'Apparel',
    sub_category: '',
    brand: '',
    image_url: '',
    stock: '',
    sku: '',
    tags: '',
    colors: '',
    sizes: '',
    weight_kg: '',
    dimensions_cm: '',
    is_featured: false,
    is_active: true,
    discount_percentage: '0',
  })

  useEffect(() => {
    fetchProducts()
  }, [page, searchTerm])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const start = (page - 1) * pageSize
      const end = start + pageSize - 1

      let query = supabase.from('products').select('*', { count: 'exact' })

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`)
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(start, end)

      if (error) throw error
      setProducts(data || [])
      setFilteredProducts(data || [])
      setTotal(count || 0)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const supabase = createClient()

      const productData = {
        name: formData.name,
        short_description: formData.short_description,
        long_description: formData.long_description,
        price: parseFloat(formData.price),
        category: formData.sub_category || formData.category,
        main_category: formData.main_category,
        sub_category: formData.sub_category || formData.category,
        brand: formData.brand,
        image_url: formData.image_url,
        stock: parseInt(formData.stock),
        sku: formData.sku || undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        colors: formData.colors ? formData.colors.split(',').map(c => c.trim()) : [],
        sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()) : [],
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : undefined,
        dimensions_cm: formData.dimensions_cm || undefined,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        discount_percentage: parseInt(formData.discount_percentage),
      }

      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)

        if (error) throw error
        alert('Product updated successfully!')
      } else {
        // Insert new product
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()

        if (error) throw error
        alert('Product added successfully!')
      }

      resetForm()
      fetchProducts()
    } catch (error) {
      console.error('Failed to save product:', error)
      alert('Failed to save product')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      short_description: '',
      long_description: '',
      price: '',
      category: '',
      main_category: 'Apparel',
      sub_category: '',
      brand: '',
      image_url: '',
      stock: '',
      sku: '',
      tags: '',
      colors: '',
      sizes: '',
      weight_kg: '',
      dimensions_cm: '',
      is_featured: false,
      is_active: true,
      discount_percentage: '0',
    })
    setEditingProduct(null)
    setShowForm(false)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      short_description: product.short_description || '',
      long_description: product.long_description || '',
      price: product.price.toString(),
      category: product.category,
      main_category: product.main_category || 'Apparel',
      sub_category: product.sub_category || product.category,
      brand: product.brand,
      image_url: product.image_url || '',
      stock: product.stock.toString(),
      sku: product.sku || '',
      tags: product.tags?.join(', ') || '',
      colors: product.colors?.join(', ') || '',
      sizes: product.sizes?.join(', ') || '',
      weight_kg: product.weight_kg?.toString() || '',
      dimensions_cm: product.dimensions_cm || '',
      is_featured: product.is_featured || false,
      is_active: product.is_active !== false,
      discount_percentage: product.discount_percentage?.toString() || '0',
    })
    setShowForm(true)
  }

  const generateAIContent = async () => {
    if (!formData.name || !formData.brand) {
      alert('Please enter product name and brand first')
      return
    }

    setGeneratingAI(true)
    try {
      const response = await fetch('/api/admin/products/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: formData.name,
          brand: formData.brand,
          category: formData.sub_category || formData.category,
          action: 'generate-description',
          customPrompt: descriptionPrompt || undefined,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setFormData({
          ...formData,
          short_description: result.short_description,
          long_description: result.long_description,
        })
        alert('AI description generated!')
      } else {
        alert(result.error || 'Failed to generate content')
      }
    } catch (error) {
      console.error('AI generation error:', error)
      alert('Failed to generate AI content')
    } finally {
      setGeneratingAI(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Delete this product?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error
      setProducts(products.filter(p => p.id !== productId))
      alert('Product deleted successfully')
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  if (loading && products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-64 bg-secondary rounded-lg animate-pulse" />
        <div className="bg-background rounded-2xl border border-border p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-secondary rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-2">Manage your product catalog</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border border-border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className={viewMode === 'table' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Product Form */}
      {showForm && (
        <div className="bg-background rounded-2xl border border-border p-6 max-h-[80vh] overflow-y-auto">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-6">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Basic Info */}
            <FormSection title="Basic Information">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  placeholder="Product Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-2"
                  required
                />
                <Input
                  type="text"
                  placeholder="SKU (optional)"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
                <Input
                  type="text"
                  placeholder="Brand *"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                />
              </div>
            </FormSection>

            {/* Descriptions with AI */}
            <FormSection title="Descriptions">
              <div className="flex justify-end gap-2 mb-4">
                <Button
                  type="button"
                  onClick={() => setShowPromptInputs(!showPromptInputs)}
                  variant="outline"
                  size="sm"
                >
                  {showPromptInputs ? '🔽 Hide Prompts' : '⚙️ Custom Prompts'}
                </Button>
                <Button
                  type="button"
                  onClick={generateAIContent}
                  disabled={generatingAI}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {generatingAI ? 'Generating...' : 'Generate with AI'}
                </Button>
              </div>

              {showPromptInputs && (
                <div className="mb-4 p-4 bg-secondary/50 rounded-xl border border-border">
                  <label className="block text-sm font-medium mb-2 text-foreground">Custom Description Prompt (optional)</label>
                  <textarea
                    placeholder="Leave empty for default: Tech-focused description for African developers. Or customize: 'Write a funny description for gamers...'"
                    value={descriptionPrompt}
                    onChange={(e) => setDescriptionPrompt(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 Default: Professional tech-focused description for African developers & engineers
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Short Description (150 chars max)"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  maxLength={150}
                />
                <textarea
                  placeholder="Long Description (detailed product info)"
                  value={formData.long_description}
                  onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
                  rows={4}
                />
              </div>
            </FormSection>

            {/* Categories */}
            <FormSection title="Categories">
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.main_category}
                  onChange={(e) => setFormData({ ...formData, main_category: e.target.value })}
                  className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                >
                  <option value="Apparel">Apparel</option>
                  <option value="Accessories">Accessories</option>
                </select>
                <select
                  value={formData.sub_category}
                  onChange={(e) => setFormData({ ...formData, sub_category: e.target.value, category: e.target.value })}
                  className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                >
                  <option value="">Select Sub-Category *</option>
                  <option value="hoodies">Hoodies</option>
                  <option value="tshirts">T-Shirts</option>
                  <option value="sweatshirts">Sweatshirts</option>
                  <option value="stickers">Stickers</option>
                  <option value="mugs">Mugs</option>
                  <option value="headbands">Headbands</option>
                </select>
              </div>
            </FormSection>

            {/* Pricing & Stock */}
            <FormSection title="Pricing & Inventory">
              <div className="grid grid-cols-3 gap-4">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Price (KSh) *"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
                <Input
                  type="number"
                  placeholder="Stock Quantity *"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
                <Input
                  type="number"
                  placeholder="Discount %"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                  min="0"
                  max="100"
                />
              </div>
            </FormSection>

            {/* Product Variants */}
            <FormSection title="Variants">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  placeholder="Colors (e.g., Black, White, Gray)"
                  value={formData.colors}
                  onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                />
                <Input
                  type="text"
                  placeholder="Sizes (e.g., S, M, L, XL)"
                  value={formData.sizes}
                  onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                />
                <Input
                  type="text"
                  placeholder="Tags (e.g., new, sale, trending)"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="col-span-2"
                />
              </div>
            </FormSection>

            {/* Physical Properties */}
            <FormSection title="Physical Properties" defaultOpen={false}>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Weight (kg)"
                  value={formData.weight_kg}
                  onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                />
                <Input
                  type="text"
                  placeholder="Dimensions (L x W x H cm)"
                  value={formData.dimensions_cm}
                  onChange={(e) => setFormData({ ...formData, dimensions_cm: e.target.value })}
                />
              </div>
            </FormSection>

            {/* Image */}
            <FormSection title="Product Image">
              <Input
                type="text"
                placeholder="Image URL"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
              {formData.image_url && (
                <img src={formData.image_url} alt="Preview" className="mt-3 h-32 w-32 object-cover rounded-lg border border-border" />
              )}
            </FormSection>

            {/* Settings */}
            <FormSection title="Settings">
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm text-foreground">Featured Product</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm text-foreground">Active (visible to customers)</span>
                </label>
              </div>
            </FormSection>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="bg-foreground text-background hover:bg-foreground/90">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
              <Button
                type="button"
                onClick={resetForm}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
        <Input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Product List Section */}
      <FormSection title={`Product List (${total})`} defaultOpen={true}>
        {/* Grid View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full bg-background rounded-2xl border border-border p-12 text-center">
                <p className="text-muted-foreground">No products found</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id} className="bg-background rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="aspect-square relative bg-secondary/20">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        onClick={() => handleEdit(product)}
                        size="icon"
                        className="h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        onClick={() => handleDeleteProduct(product.id)}
                        size="icon"
                        className="h-8 w-8 bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{product.brand}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-foreground">KSh {product.price.toLocaleString()}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock < 5 ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-600'}`}>
                        {product.stock} in stock
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Table View */
          <div className="bg-background rounded-2xl border border-border overflow-hidden mt-4">
            <table className="w-full">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Brand</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{product.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{product.brand}</td>
                      <td className="px-6 py-4 text-muted-foreground">{product.category}</td>
                      <td className="px-6 py-4 text-foreground">KSh {product.price.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.stock < 5 ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-600'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <Button
                          onClick={() => handleEdit(product)}
                          variant="ghost"
                          size="icon"
                          className="hover:bg-blue-500/10 hover:text-blue-600"
                        >
                          <Edit2 size={18} />
                        </Button>
                        <Button
                          onClick={() => handleDeleteProduct(product.id)}
                          variant="ghost"
                          size="icon"
                          className="hover:bg-red-500/10 hover:text-red-600"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </FormSection>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} of {total} products
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="outline"
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-sm text-foreground">Page {page} of {Math.ceil(total / pageSize)}</span>
          <Button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / pageSize)}
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
