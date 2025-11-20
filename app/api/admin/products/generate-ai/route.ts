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

import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

async function generateImage(
  productName: string,
  brand?: string,
  category?: string,
  customPrompt?: string
) {
  try {
    // Craft a detailed prompt for Flux.1
    let prompt = ''
    
    if (!customPrompt) {
      // Enhanced prompts for Flux.1
      if (category === 'hoodies') {
        prompt = `Professional product photography of a young African ${Math.random() > 0.5 ? 'man' : 'woman'} wearing a high quality ${productName} hoodie${brand ? ` with "${brand}" written on it` : ''}. The text "${brand || ''}" should be clearly visible and spelled correctly on the chest. Modern tech office background with blurred code on screens. Cinematic lighting, 8k resolution, photorealistic, highly detailed fabric texture.`
      } else if (category === 'tshirts') {
        prompt = `Professional product photography of a young African ${Math.random() > 0.5 ? 'man' : 'woman'} wearing a fitted ${productName} t-shirt${brand ? ` with the text "${brand}" printed on it` : ''}. The text "${brand || ''}" is legible and sharp. Tech workspace setting, warm lighting, depth of field. 8k resolution, photorealistic, detailed skin texture.`
      } else if (category === 'stickers') {
        prompt = `A high quality die-cut sticker of the ${brand || productName} logo on a silver MacBook Pro laptop lid. The sticker says "${brand || productName}". Sharp focus, studio lighting, 4k resolution, product photography.`
      } else if (category === 'mugs') {
        prompt = `A ceramic coffee mug sitting on a wooden desk next to a laptop with code on the screen. The mug has the text "${brand || productName}" printed on it. The text is spelled correctly and clearly visible. Warm cozy lighting, bokeh effect, photorealistic 8k.`
      } else {
        prompt = `Professional product photography of ${productName}${brand ? ` by ${brand}` : ''}. Studio lighting, clean background, 8k resolution, photorealistic.`
      }
    } else {
      prompt = customPrompt
    }

    console.log('Generating image with Flux.1 using prompt:', prompt)

    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: prompt,
          go_fast: true,
          megapixels: "1",
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 80
        }
      }
    )

    // Flux returns an array of ReadableStreams or URLs
    // The output is usually an array of strings (URLs)
    const imageUrl = Array.isArray(output) ? output[0] : output

    if (!imageUrl) {
      throw new Error('No image URL returned from Replicate')
    }

    // For the browser to display it, we might need to fetch and convert to base64 
    // if the URL is temporary or restricted, but Replicate URLs are usually public for a short time.
    // Ideally, we should upload this to our own storage (Supabase Storage), 
    // but for now we'll return the URL directly or convert to base64 if needed.
    // Let's fetch and convert to base64 to be safe and consistent with previous implementation.
    
    const imageRes = await fetch(String(imageUrl))
    const imageBuffer = await imageRes.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const dataUrl = `data:image/webp;base64,${base64Image}`

    return NextResponse.json({
      success: true,
      image_url: dataUrl,
      ai_generated: true,
      model: 'Flux.1 Schnell',
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
