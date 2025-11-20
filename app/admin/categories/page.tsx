'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { Trash2, Edit2, Plus, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Category {
    id: string
    name: string
    slug: string
    description?: string
    parent_id?: string
    created_at?: string
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        parent_id: '',
    })

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true })

            if (error) throw error
            setCategories(data || [])
        } catch (error) {
            console.error('Failed to fetch categories:', error)
            alert('Failed to load categories')
        } finally {
            setLoading(false)
        }
    }

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const supabase = createClient()
            const slug = generateSlug(formData.name)

            if (editingId) {
                const { error } = await supabase
                    .from('categories')
                    .update({
                        name: formData.name,
                        slug,
                        description: formData.description || null,
                        parent_id: formData.parent_id || null,
                    })
                    .eq('id', editingId)

                if (error) throw error
                alert('Category updated successfully!')
            } else {
                const { error } = await supabase
                    .from('categories')
                    .insert([{
                        name: formData.name,
                        slug,
                        description: formData.description || null,
                        parent_id: formData.parent_id || null,
                    }])

                if (error) throw error
                alert('Category created successfully!')
            }

            resetForm()
            fetchCategories()
        } catch (error) {
            console.error('Failed to save category:', error)
            alert('Failed to save category')
        }
    }

    const handleEdit = (category: Category) => {
        setEditingId(category.id)
        setFormData({
            name: category.name,
            description: category.description || '',
            parent_id: category.parent_id || '',
        })
        setShowAddForm(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this category? This will also affect subcategories.')) return

        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id)

            if (error) throw error
            alert('Category deleted successfully!')
            fetchCategories()
        } catch (error) {
            console.error('Failed to delete category:', error)
            alert('Failed to delete category')
        }
    }

    const resetForm = () => {
        setFormData({ name: '', description: '', parent_id: '' })
        setEditingId(null)
        setShowAddForm(false)
    }

    const getParentCategories = () => {
        return categories.filter(cat => !cat.parent_id)
    }

    const getSubcategories = (parentId: string) => {
        return categories.filter(cat => cat.parent_id === parentId)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading categories...</div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-heading font-bold">Category Management</h1>
                <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-blue-600 text-white"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                </Button>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
                <div className="bg-secondary/20 border border-border rounded-2xl p-6 mb-6">
                    <h2 className="text-xl font-heading font-bold mb-4">
                        {editingId ? 'Edit Category' : 'Add New Category'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Category Name *</label>
                            <Input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., T-Shirts, Hoodies, Accessories"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Optional description"
                                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Parent Category (for subcategories)</label>
                            <select
                                value={formData.parent_id}
                                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
                            >
                                <option value="">None (Main Category)</option>
                                {getParentCategories().map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" className="bg-blue-600 text-white">
                                <Save className="w-4 h-4 mr-2" />
                                {editingId ? 'Update' : 'Create'} Category
                            </Button>
                            <Button type="button" variant="outline" onClick={resetForm}>
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Categories List */}
            <div className="space-y-4">
                {getParentCategories().map((category) => (
                    <div key={category.id} className="bg-background border border-border rounded-2xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-heading font-bold">{category.name}</h3>
                                {category.description && (
                                    <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">Slug: {category.slug}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(category)}
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(category.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Subcategories */}
                        {getSubcategories(category.id).length > 0 && (
                            <div className="ml-6 mt-4 space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground">Subcategories:</h4>
                                {getSubcategories(category.id).map((subcat) => (
                                    <div
                                        key={subcat.id}
                                        className="flex justify-between items-center bg-secondary/20 rounded-lg p-3"
                                    >
                                        <div>
                                            <p className="font-medium">{subcat.name}</p>
                                            {subcat.description && (
                                                <p className="text-xs text-muted-foreground">{subcat.description}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(subcat)}
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(subcat.id)}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {categories.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No categories yet. Click "Add Category" to create one.
                    </div>
                )}
            </div>
        </div>
    )
}
