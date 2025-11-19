'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { AlertTriangle, TrendingDown } from 'lucide-react'

export default function InventoryPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, low, out

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

  const updateStock = async (productId, newStock) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('products')
        .update({ stock: parseInt(newStock) })
        .eq('id', productId)

      if (error) throw error

      setProducts(products.map(p => 
        p.id === productId ? { ...p, stock: parseInt(newStock) } : p
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
    return <div className="text-center py-12">Loading inventory...</div>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Inventory Management</h1>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded">
                <TrendingDown className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded">
                <AlertTriangle className="text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
              </div>
              <div className="bg-red-100 p-3 rounded">
                <AlertTriangle className="text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="flex gap-2">
          {['all', 'low', 'out'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded ${
                filter === f
                  ? 'bg-black text-white'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              {f === 'all' ? 'All' : f === 'low' ? 'Low Stock' : 'Out of Stock'}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Product</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Current Stock</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Update Stock</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No products match this filter
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{product.name}</td>
                  <td className="px-6 py-4 text-sm">{product.category}</td>
                  <td className="px-6 py-4 font-bold text-lg">{product.stock}</td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      min="0"
                      value={product.stock}
                      onChange={(e) => updateStock(product.id, e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      product.stock === 0
                        ? 'bg-red-100 text-red-800'
                        : product.stock < 5
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
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

      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredProducts.length} of {products.length} products
      </div>
    </div>
  )
}
