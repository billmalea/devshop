# AI Content Generation Setup

## Overview
DevShop uses AI to generate product descriptions and images automatically through the admin panel.

## Features
- **AI-Generated Descriptions**: Creates short and long product descriptions optimized for e-commerce
- **AI-Generated Images**: Product photography using AI image generation models
- **Metadata Generation**: Auto-generates SEO-friendly meta titles and descriptions

## Setup Instructions

### 1. Google AI (Gemini) for Descriptions
We use Gemini 2.0 Flash for generating product descriptions.

**Get API Key:**
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create a new API key
3. Add to your `.env.local`:
```bash
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

**Features:**
- Fast generation (< 2 seconds)
- High-quality, professional descriptions
- JSON-formatted responses
- No watermarks in text output

### 2. Image Generation Options

#### Option A: Replicate (Recommended)
Replicate offers easy-to-use image generation with multiple models.

**Setup:**
1. Sign up at [Replicate](https://replicate.com)
2. Get your API token from [Account Settings](https://replicate.com/account/api-tokens)
3. Add to `.env.local`:
```bash
REPLICATE_API_TOKEN=your_replicate_token_here
```

**Available Models:**
- `black-forest-labs/flux-schnell` - Fast, high-quality (default)
- `black-forest-labs/flux-dev` - Higher quality, slower
- `stability-ai/sdxl` - Stable Diffusion XL

**Advantages:**
- ✅ No watermarks
- ✅ Simple API
- ✅ Pay-per-use pricing
- ✅ Multiple model options
- ✅ Direct image URL output

#### Option B: Google Imagen 3
Google's latest image generation model.

**Setup:**
Already using `GOOGLE_AI_API_KEY` from above.

**Note:** Requires additional setup for image storage:
- Images are generated but need to be stored somewhere
- Requires Google Cloud Storage or similar service
- More complex integration

#### Option C: Custom Implementation
You can also integrate:
- OpenAI DALL-E 3
- Midjourney API (when available)
- Stable Diffusion self-hosted

### 3. Image Storage (Required for production)
Generated images need to be stored permanently.

**Options:**

#### Supabase Storage (Recommended)
```typescript
import { createClient } from '@/lib/server'

async function uploadImage(imageBlob: Blob) {
  const supabase = createClient()
  const fileName = `products/${Date.now()}.webp`
  
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, imageBlob)
  
  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName)
  
  return publicUrl
}
```

#### Cloudinary
```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Usage in Admin Panel

### Generating Product Content

1. **Navigate to Admin → Products**
2. **Click "Add Product"** or edit existing product
3. **Fill in basic info** (name, brand, category)
4. **Click "✨ Generate with AI"** for descriptions
5. **Click "🎨 Generate Image"** for product photo
6. **Review and adjust** generated content
7. **Save product**

### Tips for Best Results

**Descriptions:**
- Provide clear product names: "AWS Cloud Hoodie" vs "Hoodie"
- Include brand for better context
- Select appropriate category

**Images:**
- More descriptive product names = better images
- Category helps model understand product type
- Generated images work best for standard products (hoodies, t-shirts, etc.)

## Product Schema

### Enhanced Product Fields
```typescript
interface Product {
  // Basic
  name: string
  slug: string (auto-generated)
  sku: string
  
  // Descriptions
  short_description: string (150 chars)
  long_description: text
  
  // Categories
  main_category: 'Apparel' | 'Accessories'
  sub_category: 'hoodies' | 'tshirts' | 'sweatshirts' | 'stickers' | 'headbands'
  brand: string
  
  // Pricing
  price: decimal
  discount_percentage: integer
  
  // Inventory
  stock: integer
  
  // Variants
  colors: string[]
  sizes: string[]
  tags: string[]
  
  // Physical
  weight_kg: decimal
  dimensions_cm: string
  
  // Media
  image_url: string
  ai_generated_image: boolean
  ai_generated_description: boolean
  
  // SEO
  meta_title: string
  meta_description: string
  
  // Settings
  is_featured: boolean
  is_active: boolean
}
```

## Database Setup

Run the enhancement script in Supabase SQL Editor:
```sql
-- Located at: scripts/009_enhance_products_schema.sql
```

This adds:
- New product fields
- Auto-slug generation
- Product categories table
- Product brands table
- Search indexes

## Cost Estimation

### Gemini API (Descriptions)
- Model: `gemini-2.0-flash-exp`
- Cost: Free tier available, then ~$0.00015 per request
- Speed: 1-2 seconds per generation

### Replicate (Images)
- Model: `flux-schnell`
- Cost: ~$0.003 per image
- Speed: 3-5 seconds per generation

**Example Monthly Cost:**
- 100 products with AI descriptions: ~$0.015
- 100 products with AI images: ~$0.30
- **Total: ~$0.32/month** for 100 products

## API Endpoints

### Generate AI Content
```typescript
POST /api/admin/products/generate-ai

// Generate description
{
  "productName": "AWS Cloud Hoodie",
  "brand": "AWS",
  "category": "hoodies",
  "action": "generate-description"
}

// Generate image
{
  "productName": "AWS Cloud Hoodie",
  "brand": "AWS",
  "category": "hoodies",
  "action": "generate-image"
}
```

## Troubleshooting

### "Failed to generate content"
- Check API keys in `.env.local`
- Verify API key permissions
- Check API quota limits

### Images not saving
- Implement image storage (Supabase Storage, Cloudinary)
- Update image generation endpoint to upload images

### Generated images have watermarks
- Avoid using free image APIs that add watermarks
- Use Replicate or self-hosted models (no watermarks)
- Google Imagen through API doesn't add watermarks

## Future Enhancements
- [ ] Batch AI generation for multiple products
- [ ] Multiple image variants per product
- [ ] A/B testing for AI-generated descriptions
- [ ] Image editing and refinement
- [ ] Custom prompts for specific brand styles
- [ ] Background removal from product images

## Support
For issues or questions about AI integration, check:
- [Google AI Documentation](https://ai.google.dev/docs)
- [Replicate Documentation](https://replicate.com/docs)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
