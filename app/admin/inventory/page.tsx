'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { AlertTriangle, TrendingDown, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Product {
  id: string
  name: string
  category: string
  stock: number
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('stock', { ascending: true })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStock = async (productId: string, newStock: string | number) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('products')
        .update({ stock: parseInt(String(newStock)) })
        .eq('id', productId)

      if (error) throw error

      setProducts(products.map(p =>
        p.id === productId ? { ...p, stock: parseInt(String(newStock)) } : p
      ))
      alert('Stock updated')
    } catch (error) {
      console.error('Failed to update stock:', error)
    }
  }

  const getFilteredProducts = () => {
    switch (filter) {
      case 'low':
        return products.filter(p => p.stock > 0 && p.stock < 5)
      case 'out':
        return products.filter(p => p.stock === 0)
      default:
        return products
    }
  }

  const filteredProducts = getFilteredProducts()
  const lowStockCount = products.filter(p => p.stock < 5).length
  const outOfStockCount = products.filter(p => p.stock === 0).length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-64 bg-secondary rounded-lg animate-pulse" />
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-secondary rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-heading font-bold text-foreground">Inventory</h1>
        <p className="text-muted-foreground mt-2">Track and manage product stock levels</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-background rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-2">Total Products</p>
              <p className="text-3xl font-bold text-foreground">{products.length}</p>
            </div>
            <div className="bg-blue-500/10 p-4 rounded-xl">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-background rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-2">Low Stock</p>
              <p className="text-3xl font-bold text-yellow-600">{lowStockCount}</p>
            </div>
            <div className="bg-yellow-500/10 p-4 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-background rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-2">Out of Stock</p>
              <p className="text-3xl font-bold text-red-600">{outOfStockCount}</p>
            </div>
            <div className="bg-red-500/10 p-4 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'low', 'out'].map(f => (
          <Button
            key={f}
            onClick={() => setFilter(f)}
            variant={filter === f ? 'default' : 'outline'}
            className={filter === f ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            {f === 'all' ? 'All' : f === 'low' ? 'Low Stock' : 'Out of Stock'}
          </Button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="bg-background rounded-2xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Product</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Category</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Current Stock</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Update Stock</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  No products match this filter
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{product.category}</td>
                  <td className="px-6 py-4 font-bold text-lg text-foreground">{product.stock}</td>
                  <td className="px-6 py-4">
                    <Input
                      type="number"
                      min="0"
                      value={product.stock}
                      onChange={(e) => updateStock(product.id, e.target.value)}
                      className="w-20"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.stock === 0
                        ? 'bg-red-500/10 text-red-600'
                        : product.stock < 5
                          ? 'bg-yellow-500/10 text-yellow-600'
                          : 'bg-green-500/10 text-green-600'
                      }`}>
                      {product.stock === 0 ? 'Out' : product.stock < 5 ? 'Low' : 'In Stock'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredProducts.length} of {products.length} products
      </div>
    </div>
  )
}
