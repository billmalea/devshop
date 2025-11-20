'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal } from 'lucide-react'
import { ProductFilters } from '@/components/product-filters'

interface MobileFiltersProps {
    currentCategory?: string
    currentBrand?: string
}

export function MobileFilters({ currentCategory, currentBrand }: MobileFiltersProps) {
    const [open, setOpen] = useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full mb-4 border-border hover:bg-secondary"
                >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters & Categories
                    {(currentCategory || currentBrand) && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                            {[currentCategory, currentBrand].filter(Boolean).length}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                    <ProductFilters
                        currentCategory={currentCategory}
                        currentBrand={currentBrand}
                    />
                </div>
            </SheetContent>
        </Sheet>
    )
}
