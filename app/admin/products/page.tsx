'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { Trash2, Edit2, Search, Plus } from 'lucide-react'

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
  const [imagePrompt, setImagePrompt] = useState('')
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

  const generateAIContent = async (type: 'description' | 'image') => {
    if (!formData.name || !formData.brand) {
      alert('Please enter product name and brand first')
      return
    }

    setGeneratingAI(true)
    try {
      const customPrompt = type === 'description' ? descriptionPrompt : imagePrompt
      
      const response = await fetch('/api/admin/products/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: formData.name,
          brand: formData.brand,
          category: formData.sub_category || formData.category,
          action: type === 'description' ? 'generate-description' : 'generate-image',
          customPrompt: customPrompt || undefined,
        }),
      })

      const result = await response.json()

      if (result.success) {
        if (type === 'description') {
          setFormData({
            ...formData,
            short_description: result.short_description,
            long_description: result.long_description,
          })
          alert('AI description generated!')
        } else {
          setFormData({
            ...formData,
            image_url: result.image_url,
          })
          alert('AI image generated!')
        }
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
      <div>
        <div className="h-8 w-48 bg-gray-200 rounded mb-6 animate-pulse" />
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Product Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6 max-h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Info */}
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-3 text-gray-700">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Product Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-2 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
                <input
                  type="text"
                  placeholder="SKU (optional)"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
                <input
                  type="text"
                  placeholder="Brand *"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
            </div>

            {/* Descriptions with AI */}
            <div className="border-b pb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-700">Descriptions</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPromptInputs(!showPromptInputs)}
                    className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                  >
                    {showPromptInputs ? '🔽 Hide Prompts' : '⚙️ Custom Prompts'}
                  </button>
                  <button
                    type="button"
                    onClick={() => generateAIContent('description')}
                    disabled={generatingAI}
                    className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50"
                  >
                    {generatingAI ? '⏳ Generating...' : '✨ Generate with AI'}
                  </button>
                </div>
              </div>
              
              {showPromptInputs && (
                <div className="mb-3 p-3 bg-gray-50 rounded border">
                  <label className="block text-sm font-medium mb-2">Custom Description Prompt (optional)</label>
                  <textarea
                    placeholder="Leave empty for default: Tech-focused description for African developers. Or customize: 'Write a funny description for gamers...'"
                    value={descriptionPrompt}
                    onChange={(e) => setDescriptionPrompt(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={2}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Default: Professional tech-focused description for African developers & engineers
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Short Description (150 chars max)"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  maxLength={150}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
                <textarea
                  placeholder="Long Description (detailed product info)"
                  value={formData.long_description}
                  onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  rows={4}
                />
              </div>
            </div>

            {/* Categories */}
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-3 text-gray-700">Categories</h3>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.main_category}
                  onChange={(e) => setFormData({ ...formData, main_category: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  required
                >
                  <option value="Apparel">Apparel</option>
                  <option value="Accessories">Accessories</option>
                </select>
                <select
                  value={formData.sub_category}
                  onChange={(e) => setFormData({ ...formData, sub_category: e.target.value, category: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  required
                >
                  <option value="">Select Sub-Category *</option>
                  <option value="hoodies">Hoodies</option>
                  <option value="tshirts">T-Shirts</option>
                  <option value="sweatshirts">Sweatshirts</option>
                  <option value="stickers">Stickers</option>
                  <option value="headbands">Headbands</option>
                </select>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-3 text-gray-700">Pricing & Inventory</h3>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price (KSh) *"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
                <input
                  type="number"
                  placeholder="Stock Quantity *"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
                <input
                  type="number"
                  placeholder="Discount %"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            {/* Product Variants */}
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-3 text-gray-700">Variants (comma-separated)</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Colors (e.g., Black, White, Gray)"
                  value={formData.colors}
                  onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
                <input
                  type="text"
                  placeholder="Sizes (e.g., S, M, L, XL)"
                  value={formData.sizes}
                  onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
                <input
                  type="text"
                  placeholder="Tags (e.g., new, sale, trending)"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="col-span-2 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            {/* Physical Properties */}
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-3 text-gray-700">Physical Properties</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Weight (kg)"
                  value={formData.weight_kg}
                  onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
                <input
                  type="text"
                  placeholder="Dimensions (L x W x H cm)"
                  value={formData.dimensions_cm}
                  onChange={(e) => setFormData({ ...formData, dimensions_cm: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            {/* Image with AI */}
            <div className="border-b pb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-700">Product Image</h3>
                <button
                  type="button"
                  onClick={() => generateAIContent('image')}
                  disabled={generatingAI}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {generatingAI ? '⏳ Generating...' : '🎨 Generate Image'}
                </button>
              </div>

              {showPromptInputs && (
                <div className="mb-3 p-3 bg-gray-50 rounded border">
                  <label className="block text-sm font-medium mb-2">Custom Image Prompt (optional)</label>
                  <textarea
                    placeholder="Leave empty for default: African models wearing apparel in tech settings, or brand-specific sticker photos. Customize: 'Person in coffee shop wearing...'"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Default: African men/women models for apparel, brand-themed sticker arrangements
                  </p>
                </div>
              )}
              
              <input
                type="text"
                placeholder="Image URL"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              />
              {formData.image_url && (
                <img src={formData.image_url} alt="Preview" className="mt-3 h-32 w-32 object-cover rounded border" />
              )}
            </div>

            {/* Settings */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-700">Settings</h3>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Featured Product</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Active (visible to customers)</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <button type="submit" className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Product</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Brand</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Stock</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{product.name}</td>
                  <td className="px-6 py-4">{product.brand}</td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4">KSh {product.price.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-sm ${product.stock < 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="p-2 hover:bg-gray-200 rounded"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 hover:bg-red-200 rounded text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} of {total} products
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Previous
          </button>
          <span className="px-4 py-2">Page {page} of {Math.ceil(total / pageSize)}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / pageSize)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
