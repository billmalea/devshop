'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { Trash2, Edit2, Search, Plus, Sparkles, Image as ImageIcon, Grid3x3, List, ChevronDown, ChevronUp, Upload, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { formatProductData } from '@/lib/format'

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
  images?: string[]
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

const COLORS = [
  { name: 'Black', class: 'bg-black', border: 'border-gray-200' },
  { name: 'White', class: 'bg-white', border: 'border-gray-300' },
  { name: 'Gray', class: 'bg-gray-500', border: 'border-transparent' },
  { name: 'Navy', class: 'bg-blue-900', border: 'border-transparent' },
  { name: 'Blue', class: 'bg-blue-600', border: 'border-transparent' },
  { name: 'Red', class: 'bg-red-600', border: 'border-transparent' },
  { name: 'Green', class: 'bg-green-600', border: 'border-transparent' },
  { name: 'Yellow', class: 'bg-yellow-400', border: 'border-transparent' },
  { name: 'Purple', class: 'bg-purple-600', border: 'border-transparent' },
]

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

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
  const [uploading, setUploading] = useState(false)
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
    images: [] as string[],
    stock: '',
    sku: '',
    tags: '',
    colors: 'Black', // Default to Black
    sizes: '',
    weight_kg: '',
    dimensions_cm: '',
    is_featured: false,
    is_active: true,
    discount_percentage: '0',
  })

  const [isRestored, setIsRestored] = useState(false)

  useEffect(() => {
    const savedState = localStorage.getItem('product_form_state')
    if (savedState) {
      try {
        const { formData: savedData, editingProduct: savedEditing, showForm: savedShow } = JSON.parse(savedState)
        setFormData(savedData)
        setEditingProduct(savedEditing)
        setShowForm(savedShow)
      } catch (e) {
        console.error('Error parsing saved state', e)
      }
    }
    setIsRestored(true)
  }, [])

  useEffect(() => {
    if (isRestored) {
      const state = { formData, editingProduct, showForm }
      localStorage.setItem('product_form_state', JSON.stringify(state))
    }
  }, [formData, editingProduct, showForm, isRestored])

  useEffect(() => {
    fetchProducts()
  }, [page, searchTerm])

  // Auto-generate SKU when name and brand change
  useEffect(() => {
    if (formData.name && formData.brand && !editingProduct) {
      const brandCode = formData.brand.substring(0, 3).toUpperCase()
      const nameCode = formData.name.substring(0, 3).toUpperCase().replace(/\s/g, '')
      const randomNum = Math.floor(1000 + Math.random() * 9000)
      const generatedSKU = `${brandCode}-${nameCode}-${randomNum}`

      if (!formData.sku) {
        setFormData(prev => ({ ...prev, sku: generatedSKU }))
      }
    }
  }, [formData.name, formData.brand, editingProduct])

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

      // Prepare raw product data
      const rawProductData = {
        name: formData.name,
        short_description: formData.short_description,
        long_description: formData.long_description,
        price: parseFloat(formData.price),
        category: formData.sub_category || formData.category,
        main_category: formData.main_category,
        sub_category: formData.sub_category || formData.category,
        brand: formData.brand,
        image_url: formData.image_url,
        images: formData.images,
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

      // Format the data for consistent capitalization
      const productData = formatProductData(rawProductData)

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

      localStorage.removeItem('product_form_state')
      resetForm()
      fetchProducts()
    } catch (error) {
      console.error('Failed to save product:', error)
      alert('Failed to save product')
    }
  }

  const resetForm = () => {
    localStorage.removeItem('product_form_state')
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
      images: [],
      stock: '',
      sku: '',
      tags: '',
      colors: 'Black',
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
      images: product.images || [],
      stock: product.stock.toString(),
      sku: product.sku || '',
      tags: product.tags?.join(', ') || '',
      colors: product.colors?.join(', ') || 'Black',
      sizes: product.sizes?.join(', ') || '',
      weight_kg: product.weight_kg?.toString() || '',
      dimensions_cm: product.dimensions_cm || '',
      is_featured: product.is_featured || false,
      is_active: product.is_active !== false,
      discount_percentage: product.discount_percentage?.toString() || '0',
    })
    setShowForm(true)
  }

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<File[]>([])

  // ... existing useEffects ...

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      const supabase = createClient()
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, selectedFile)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName)

      setFormData({ ...formData, image_url: publicUrl })
      setSelectedFile(null)
      setPreviewUrl(null)
      alert('Image uploaded successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setFormData({ ...formData, image_url: '' })
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  const cancelSelection = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newFiles = Array.from(files)
    setSelectedGalleryFiles(prev => [...prev, ...newFiles])
  }

  const handleGalleryUpload = async () => {
    if (selectedGalleryFiles.length === 0) return

    setUploading(true)
    try {
      const supabase = createClient()
      const newImages: string[] = []

      for (let i = 0; i < selectedGalleryFiles.length; i++) {
        const file = selectedGalleryFiles[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `gallery/${Date.now()}-${i}.${fileExt}`
        const { error } = await supabase.storage
          .from('products')
          .upload(fileName, file)

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(fileName)

        newImages.push(publicUrl)
      }

      setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...newImages] }))
      setSelectedGalleryFiles([])
      alert(`${newImages.length} images uploaded to gallery!`)
    } catch (error) {
      console.error('Gallery upload error:', error)
      alert('Failed to upload gallery images')
    } finally {
      setUploading(false)
    }
  }

  const removeSelectedGalleryFile = (index: number) => {
    setSelectedGalleryFiles(prev => prev.filter((_, i) => i !== index))
  }

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }))
  }

  const generateAIContent = async () => {
    console.log('generateAIContent called')
    // ... (rest of generateAIContent)
    if (!formData.name || !formData.brand) {
      alert('Please enter product name and brand first')
      return
    }

    console.log('Starting generation with:', {
      name: formData.name,
      brand: formData.brand,
      image: formData.image_url
    })

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
          imageUrl: formData.image_url || undefined,
        }),
      })

      console.log('API Response status:', response.status)
      const result = await response.json()
      console.log('API Result:', result)

      if (result.success) {
        setFormData(prev => ({
          ...prev,
          long_description: result.description,
          tags: result.tags.join(', '),
          weight_kg: result.weight_kg?.toString() || prev.weight_kg,
          dimensions_cm: result.dimensions_cm || prev.dimensions_cm,
        }))
        alert('AI description and tags generated!')
      } else {
        console.error('API Error:', result.error)
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

  const toggleColor = (color: string) => {
    const currentColors = formData.colors ? formData.colors.split(',').map(c => c.trim()).filter(c => c) : []
    let newColors
    if (currentColors.includes(color)) {
      newColors = currentColors.filter(c => c !== color)
    } else {
      newColors = [...currentColors, color]
    }
    setFormData({ ...formData, colors: newColors.join(', ') })
  }

  const toggleSize = (size: string) => {
    const currentSizes = formData.sizes ? formData.sizes.split(',').map(s => s.trim()).filter(s => s) : []
    let newSizes
    if (currentSizes.includes(size)) {
      newSizes = currentSizes.filter(s => s !== size)
    } else {
      newSizes = [...currentSizes, size]
    }
    setFormData({ ...formData, sizes: newSizes.join(', ') })
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

            {/* Image Upload */}
            <FormSection title="Product Image">
              <div className="flex flex-col items-center gap-4">
                <div className="w-full max-w-md">
                  {!formData.image_url && !previewUrl && (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer bg-secondary/20 hover:bg-secondary/40 transition-colors relative overflow-hidden">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to select</span> or drag and drop</p>
                        <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                      </div>
                      <input type="file" className="hidden" onChange={handleFileSelect} accept="image/*" />
                    </label>
                  )}

                  {previewUrl && !formData.image_url && (
                    <div className="relative w-full h-64 border border-border rounded-lg overflow-hidden bg-secondary/20">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm flex justify-center gap-2">
                        <Button type="button" onClick={handleUpload} disabled={uploading} className="bg-blue-600 text-white">
                          {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                          Upload Image
                        </Button>
                        <Button type="button" variant="outline" onClick={cancelSelection} disabled={uploading}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {formData.image_url && (
                    <div className="relative w-full h-64 border border-border rounded-lg overflow-hidden bg-secondary/20">
                      <img src={formData.image_url} alt="Uploaded" className="w-full h-full object-contain" />
                      <div className="absolute top-2 right-2">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={removeImage}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <Check className="w-3 h-3 mr-1" /> Uploaded
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </FormSection>

            {/* Product Gallery */}
            <FormSection title="Product Gallery (Optional)">
              <div className="space-y-4">
                {/* Uploaded Images */}
                {formData.images && formData.images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Uploaded Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.images.map((img: string, index: number) => (
                        <div key={index} className="relative aspect-square border border-border rounded-lg overflow-hidden group">
                          <img src={img} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                          <div className="absolute bottom-1 right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                            <Check size={10} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Files (Not Uploaded Yet) */}
                {selectedGalleryFiles.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Selected Files</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedGalleryFiles.map((file: File, index: number) => (
                        <div key={index} className="relative aspect-square border border-blue-500 border-dashed rounded-lg overflow-hidden group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Selected ${index + 1}`}
                            className="w-full h-full object-cover opacity-70"
                          />
                          <button
                            type="button"
                            onClick={() => removeSelectedGalleryFile(index)}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                          <div className="absolute bottom-1 right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                            Pending
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        type="button"
                        onClick={handleGalleryUpload}
                        disabled={uploading}
                        className="bg-blue-600 text-white"
                      >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                        Upload {selectedGalleryFiles.length} Image{selectedGalleryFiles.length !== 1 ? 's' : ''}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedGalleryFiles([])}
                        disabled={uploading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Add Files Button */}
                <label className="flex flex-col items-center justify-center aspect-square max-w-[200px] border-2 border-dashed border-border rounded-lg cursor-pointer bg-secondary/20 hover:bg-secondary/40 transition-colors">
                  <Plus className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Select Images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleGallerySelect}
                  />
                </label>
              </div>
            </FormSection>

            {/* Descriptions with AI */}
            <FormSection title="Descriptions (AI Powered)">
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
                  disabled={generatingAI || !formData.image_url || !formData.name || !formData.brand}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
                >
                  {generatingAI ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  {generatingAI ? 'Generating...' : 'Generate from Image'}
                </Button>
              </div>

              {/* Validation Messages */}
              {(!formData.name || !formData.brand || !formData.image_url) && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800 mb-2">⚠️ Missing Required Fields:</p>
                  <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                    {!formData.name && <li>Product Name is required</li>}
                    {!formData.brand && <li>Brand is required</li>}
                    {!formData.image_url && <li>Upload a product image first</li>}
                  </ul>
                </div>
              )}

              {generatingAI && (
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-700">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-sm font-medium">Generating AI content from your image...</p>
                  </div>
                </div>
              )}

              {showPromptInputs && (
                <div className="mb-4 p-4 bg-secondary/50 rounded-xl border border-border">
                  <label className="block text-sm font-medium mb-2 text-foreground">Custom Description Prompt (optional)</label>
                  <textarea
                    placeholder="Leave empty for default: Tech-focused description for African developers..."
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
                <label className="text-sm font-medium">Product Description</label>
                <textarea
                  placeholder="Detailed product description (AI-generated or manual)"
                  value={formData.long_description}
                  onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
                  rows={6}
                />
              </div>
            </FormSection>

            {/* Categories */}
            <FormSection title="Categories">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Colors</label>
                  <div className="flex flex-wrap gap-3">
                    {COLORS.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => toggleColor(color.name)}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all ring-2 ring-offset-2 ring-offset-background",
                          color.class,
                          color.border,
                          formData.colors.includes(color.name) ? "ring-blue-600 scale-110" : "ring-transparent hover:scale-105"
                        )}
                        title={color.name}
                      >
                        {formData.colors.includes(color.name) && (
                          <Check size={14} className={cn("text-white", color.name === 'White' || color.name === 'Yellow' ? 'text-black' : '')} />
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Selected: {formData.colors}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={cn(
                          "px-3 py-1 rounded-md text-sm font-medium border transition-colors",
                          formData.sizes.includes(size)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-background text-foreground border-border hover:border-blue-500"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Selected: {formData.sizes}</p>
                </div>

                <Input
                  type="text"
                  placeholder="Tags (e.g., new, sale, trending)"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
            </FormSection>

            {/* Physical Properties */}
            <FormSection title="Physical Properties" defaultOpen={false}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="bg-background rounded-2xl border border-border overflow-x-auto mt-4">
            <table className="w-full min-w-[800px]">
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
