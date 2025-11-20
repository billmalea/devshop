'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Subcategory {
    id: string
    name: string
    slug: string
}

interface SubcategoryTabsProps {
    subcategories: Subcategory[]
    currentSubcategory?: string
    currentCategory: string
}

export function SubcategoryTabs({ subcategories, currentSubcategory, currentCategory }: SubcategoryTabsProps) {
    return (
        <div className="mb-6">
            {/* Desktop: Horizontal tabs */}
            <div className="hidden md:block">
                <div className="border-b border-border">
                    <div className="flex gap-2 overflow-x-auto pb-px scrollbar-hide">
                        {/* All items in category */}
                        <Link
                            href={`/products?category=${currentCategory}`}
                            className={cn(
                                "relative px-6 py-3 text-sm font-medium transition-all whitespace-nowrap rounded-t-lg",
                                !currentSubcategory
                                    ? "bg-gradient-to-b from-blue-500/10 to-transparent text-blue-600 border-b-2 border-blue-600"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                            )}
                        >
                            All {currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)}
                            {!currentSubcategory && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 rounded-full" />
                            )}
                        </Link>

                        {/* Subcategory tabs */}
                        {subcategories.map((subcat) => (
                            <Link
                                key={subcat.id}
                                href={`/products?category=${currentCategory}&subcategory=${subcat.slug}`}
                                className={cn(
                                    "relative px-6 py-3 text-sm font-medium transition-all whitespace-nowrap rounded-t-lg",
                                    currentSubcategory === subcat.slug
                                        ? "bg-gradient-to-b from-blue-500/10 to-transparent text-blue-600 border-b-2 border-blue-600"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                )}
                            >
                                {subcat.name}
                                {currentSubcategory === subcat.slug && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 rounded-full" />
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile: Horizontal scroll with pills */}
            <div className="md:hidden">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {/* All items in category */}
                    <Link
                        href={`/products?category=${currentCategory}`}
                        className={cn(
                            "px-4 py-2 text-sm font-medium transition-all whitespace-nowrap rounded-full border",
                            !currentSubcategory
                                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/30"
                                : "bg-background text-muted-foreground border-border hover:border-blue-600 hover:text-blue-600"
                        )}
                    >
                        All
                    </Link>

                    {/* Subcategory pills */}
                    {subcategories.map((subcat) => (
                        <Link
                            key={subcat.id}
                            href={`/products?category=${currentCategory}&subcategory=${subcat.slug}`}
                            className={cn(
                                "px-4 py-2 text-sm font-medium transition-all whitespace-nowrap rounded-full border",
                                currentSubcategory === subcat.slug
                                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/30"
                                    : "bg-background text-muted-foreground border-border hover:border-blue-600 hover:text-blue-600"
                            )}
                        >
                            {subcat.name}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
