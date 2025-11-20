'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/client'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface Category {
    id: string
    name: string
    slug: string
    description?: string
    parent_id?: string
}

export default function CategoryNav() {
    const [categories, setCategories] = useState<Category[]>([])
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
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
        }
    }

    const getMainCategories = () => {
        return categories.filter(cat => !cat.parent_id)
    }

    const getSubcategories = (parentId: string) => {
        return categories.filter(cat => cat.parent_id === parentId)
    }

    const toggleCategory = (categoryId: string) => {
        const newExpanded = new Set(expandedCategories)
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId)
        } else {
            newExpanded.add(categoryId)
        }
        setExpandedCategories(newExpanded)
    }

    return (
        <nav className="bg-background border-b border-border">
            <div className="container mx-auto px-4">
                <ul className="flex items-center gap-1 overflow-x-auto">
                    {getMainCategories().map((category) => {
                        const subcategories = getSubcategories(category.id)
                        const hasSubcategories = subcategories.length > 0
                        const isExpanded = expandedCategories.has(category.id)

                        return (
                            <li key={category.id} className="relative group">
                                <div className="flex items-center">
                                    <Link
                                        href={`/shop/${category.slug}`}
                                        className="px-4 py-3 text-sm font-medium text-foreground hover:text-blue-600 transition-colors whitespace-nowrap"
                                    >
                                        {category.name}
                                    </Link>
                                    {hasSubcategories && (
                                        <button
                                            onClick={() => toggleCategory(category.id)}
                                            className="p-2 hover:bg-secondary rounded-lg transition-colors lg:hidden"
                                        >
                                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                        </button>
                                    )}
                                </div>

                                {/* Desktop Dropdown */}
                                {hasSubcategories && (
                                    <div className="hidden lg:block absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                        <div className="bg-background border border-border rounded-lg shadow-lg py-2 min-w-[200px]">
                                            {subcategories.map((subcat) => (
                                                <Link
                                                    key={subcat.id}
                                                    href={`/shop/${category.slug}/${subcat.slug}`}
                                                    className="block px-4 py-2 text-sm text-foreground hover:bg-secondary hover:text-blue-600 transition-colors"
                                                >
                                                    {subcat.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Mobile Expanded */}
                                {hasSubcategories && isExpanded && (
                                    <div className="lg:hidden absolute top-full left-0 w-full bg-background border border-border rounded-lg shadow-lg mt-1 py-2 z-50">
                                        {subcategories.map((subcat) => (
                                            <Link
                                                key={subcat.id}
                                                href={`/shop/${category.slug}/${subcat.slug}`}
                                                className="block px-4 py-2 text-sm text-foreground hover:bg-secondary hover:text-blue-600 transition-colors"
                                            >
                                                {subcat.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </li>
                        )
                    })}
                </ul>
            </div>
        </nav>
    )
}
