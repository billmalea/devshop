import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productName, brand, category, action, customPrompt } = body

    if (!productName || !action) {
      return NextResponse.json(
        { error: 'Product name and action are required' },
        { status: 400 }
      )
    }

    if (action === 'generate-description') {
      return await generateDescription(productName, brand, category, customPrompt)
    } else if (action === 'generate-image') {
      return await generateImage(productName, brand, category, customPrompt)
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "generate-description" or "generate-image"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}

async function generateDescription(
  productName: string,
  brand?: string,
  category?: string,
  customPrompt?: string
) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const basePrompt = customPrompt || `Generate a compelling product description for a tech-focused e-commerce site targeting developers, engineers, and tech professionals in Africa.

Product: ${productName}
${brand ? `Brand: ${brand}` : ''}
${category ? `Category: ${category}` : ''}

Target Audience: Tech professionals, developers, software engineers, and tech enthusiasts in Kenya and Africa.
Style: Professional yet casual, tech-savvy, culturally aware, emphasizing quality and developer culture.

Please provide ONE comprehensive description (150-200 words) that combines product features, benefits, and appeal to the tech community. Make it engaging and highlight why tech professionals would love this product.

Format your response as JSON:
{
  "short_description": "One catchy sentence (max 150 characters)",
  "long_description": "Single unified description (150-200 words)",
  "meta_title": "SEO-friendly title",
  "meta_description": "SEO description"
}`

    const prompt = customPrompt ? `${customPrompt}\n\nProduct: ${productName}\nBrand: ${brand || ''}\nCategory: ${category || ''}\n\nFormat as JSON with: short_description, long_description, meta_title, meta_description` : basePrompt

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response')
    }

    const descriptions = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      success: true,
      ...descriptions,
      ai_generated: true,
    })
  } catch (error) {
    console.error('Description generation error:', error)
    throw error
  }
}

async function generateImage(
  productName: string,
  brand?: string,
  category?: string,
  customPrompt?: string
) {
  try {
    // Use Gemini 2.5 Flash Image (nano banana) for image generation
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' })
    
    // Craft a detailed prompt for product image
    let basePrompt = ''
    
    if (!customPrompt) {
      // Default prompts with African models for apparel
      if (category === 'hoodies') {
        basePrompt = `Professional product photography: Young African ${Math.random() > 0.5 ? 'man' : 'woman'} wearing ${productName}${brand ? ` ${brand} branded` : ''} hoodie. 
Modern tech office or urban setting background. Natural confident pose, showing hoodie design clearly.
Studio lighting, sharp focus, fashion photography style. Model represents tech professional/developer.
High resolution, professional e-commerce photo, no text overlays, no watermarks.`
      } else if (category === 'tshirts') {
        basePrompt = `Professional product photography: Young African ${Math.random() > 0.5 ? 'man' : 'woman'} wearing ${productName}${brand ? ` ${brand} branded` : ''} t-shirt.
Tech workspace or modern office background. Casual confident pose, t-shirt design visible.
Studio lighting, sharp focus, lifestyle photography. Model represents developer/tech professional.
High resolution, professional e-commerce photo, no text overlays, no watermarks.`
      } else if (category === 'sweatshirts') {
        basePrompt = `Professional product photography: Young African ${Math.random() > 0.5 ? 'man' : 'woman'} wearing ${productName}${brand ? ` ${brand} branded` : ''} sweatshirt.
Modern tech environment or creative workspace. Natural pose, sweatshirt design clearly shown.
Studio lighting, sharp focus, lifestyle photography. Model represents tech enthusiast.
High resolution, professional e-commerce photo, no text overlays, no watermarks.`
      } else if (category === 'stickers') {
        basePrompt = `High-quality product photography of ${productName}${brand ? ` ${brand}` : ''} sticker collection.
${brand === 'Amazon' || brand === 'AWS' ? 'AWS/Amazon themed tech stickers arranged artistically' : ''}
${brand === 'Google' ? 'Colorful Google product stickers (Chrome, Android, Cloud) arranged nicely' : ''}
${brand === 'Microsoft' ? 'Microsoft Azure, Windows, VS Code stickers arranged professionally' : ''}
${brand === 'Vercel' ? 'Minimalist Vercel triangle logo stickers, modern arrangement' : ''}
${brand === 'Anthropic' ? 'Claude AI and Anthropic themed stickers, tech aesthetic' : ''}
${brand === 'GitHub' ? 'GitHub octocat and dev tool stickers, developer theme' : ''}
Clean white background or laptop surface, glossy finish, professional product photography.
High resolution, sharp focus, no text overlays, no watermarks.`
      } else if (category === 'headbands') {
        basePrompt = `Professional product photography: Young African ${Math.random() > 0.5 ? 'man' : 'woman'} wearing ${productName}${brand ? ` ${brand} branded` : ''} headband.
Athletic or casual tech setting. Natural pose, headband design visible.
Studio lighting, sharp focus, lifestyle photography.
High resolution, professional e-commerce photo, no text overlays, no watermarks.`
      } else {
        basePrompt = `Professional product photography of ${productName}${brand ? ` from ${brand}` : ''}.
Clean background, studio lighting, sharp focus, high resolution.
Professional e-commerce style, no text overlays, no watermarks.`
      }
    } else {
      basePrompt = customPrompt
    }
    
    const prompt = basePrompt

    // Generate image with Gemini 2.5 Flash Image (nano banana)
    const result = await model.generateContent(prompt)

    const response = result.response
    
    // Get the image from the response
    // Gemini 2.5 Flash Image returns base64 encoded image data
    let imageDataUrl = null
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if ('inlineData' in part && part.inlineData) {
        const imageBase64 = part.inlineData.data
        const mimeType = part.inlineData.mimeType || 'image/png'
        
        // Convert base64 to data URL (browser can display directly)
        imageDataUrl = `data:${mimeType};base64,${imageBase64}`
        break
      }
    }
    
    if (!imageDataUrl) {
      throw new Error('No image data returned from Gemini 2.5 Flash Image')
    }

    console.log('Image generated successfully with nano banana 🍌')

    return NextResponse.json({
      success: true,
      image_url: imageDataUrl,
      ai_generated: true,
      model: 'Gemini 2.5 Flash Image (nano banana 🍌)',
      note: 'Image includes SynthID watermark (invisible to humans, detectable by tools)',
    })
  } catch (error) {
    console.error('Image generation error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate image',
      suggestion: 'Check your REPLICATE_API_TOKEN and try again',
    })
  }
}
