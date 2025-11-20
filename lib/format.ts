/**
 * Text formatting utilities for consistent product data display
 */

/**
 * Converts text to Title Case (First Letter Of Each Word Capitalized)
 * Example: "hello world" -> "Hello World"
 */
export function toTitleCase(text: string): string {
    if (!text) return ''

    return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

/**
 * Converts text to Sentence case (First letter capitalized, rest lowercase)
 * Example: "HELLO WORLD" -> "Hello world"
 */
export function toSentenceCase(text: string): string {
    if (!text) return ''

    const trimmed = text.trim()
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
}

/**
 * Formats product name (Title Case)
 * Example: "nike air force 1" -> "Nike Air Force 1"
 */
export function formatProductName(name: string): string {
    if (!name) return ''
    return toTitleCase(name.trim())
}

/**
 * Formats brand name (Title Case)
 * Example: "APPLE" -> "Apple", "nike" -> "Nike"
 */
export function formatBrandName(brand: string): string {
    if (!brand) return ''
    return toTitleCase(brand.trim())
}

/**
 * Formats category name (Title Case)
 * Example: "t-shirts" -> "T-Shirts"
 */
export function formatCategoryName(category: string): string {
    if (!category) return ''
    return toTitleCase(category.trim())
}

/**
 * Formats description with proper capitalization
 * - First letter capitalized
 * - Proper sentence structure
 * - Removes extra spaces
 */
export function formatDescription(description: string): string {
    if (!description) return ''

    // Remove extra spaces and trim
    const cleaned = description.replace(/\s+/g, ' ').trim()

    // Split into sentences (by ., !, ?)
    const sentences = cleaned.split(/([.!?]\s+)/)

    // Capitalize first letter of each sentence
    const formatted = sentences.map((part, index) => {
        // Skip punctuation parts
        if (part.match(/^[.!?]\s+$/)) return part

        // Capitalize first letter of sentence
        if (part.length > 0) {
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        }
        return part
    }).join('')

    return formatted
}

/**
 * Formats SKU to uppercase
 * Example: "nik-air-1234" -> "NIK-AIR-1234"
 */
export function formatSKU(sku: string): string {
    if (!sku) return ''
    return sku.trim().toUpperCase()
}

/**
 * Formats tags (lowercase, trimmed)
 * Example: ["TECH", " Gaming "] -> ["tech", "gaming"]
 */
export function formatTags(tags: string[]): string[] {
    if (!tags || !Array.isArray(tags)) return []
    return tags.map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0)
}

/**
 * Formats a comma-separated tag string
 * Example: "TECH, Gaming, CODE" -> "tech, gaming, code"
 */
export function formatTagString(tagString: string): string {
    if (!tagString) return ''
    const tags = tagString.split(',').map(tag => tag.trim().toLowerCase())
    return tags.filter(tag => tag.length > 0).join(', ')
}

/**
 * Formats colors (Title Case)
 * Example: ["RED", "blue"] -> ["Red", "Blue"]
 */
export function formatColors(colors: string[]): string[] {
    if (!colors || !Array.isArray(colors)) return []
    return colors.map(color => toTitleCase(color.trim())).filter(color => color.length > 0)
}

/**
 * Formats sizes (Uppercase)
 * Example: ["s", "m", "xl"] -> ["S", "M", "XL"]
 */
export function formatSizes(sizes: string[]): string[] {
    if (!sizes || !Array.isArray(sizes)) return []
    return sizes.map(size => size.trim().toUpperCase()).filter(size => size.length > 0)
}

/**
 * Formats all product data for consistency
 */
export function formatProductData(product: any) {
    return {
        ...product,
        name: formatProductName(product.name),
        brand: formatBrandName(product.brand),
        category: formatCategoryName(product.category),
        main_category: formatCategoryName(product.main_category),
        sub_category: formatCategoryName(product.sub_category),
        short_description: product.short_description ? formatDescription(product.short_description) : '',
        long_description: product.long_description ? formatDescription(product.long_description) : '',
        sku: formatSKU(product.sku),
        tags: Array.isArray(product.tags) ? formatTags(product.tags) : [],
        colors: Array.isArray(product.colors) ? formatColors(product.colors) : [],
        sizes: Array.isArray(product.sizes) ? formatSizes(product.sizes) : [],
    }
}
