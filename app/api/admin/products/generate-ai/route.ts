import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productName, brand, category, action, customPrompt, imageUrl } = body

    if (!productName || !action) {
      return NextResponse.json(
        { error: 'Product name and action are required' },
        { status: 400 }
      )
    }

    if (action === 'generate-description') {
      return await generateDescription(productName, brand, category, customPrompt, imageUrl)
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Only "generate-description" is supported.' },
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
  customPrompt?: string,
  imageUrl?: string
) {
  try {
    // Fallback to gemini-pro-vision if 1.5 is not available
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' })

    let promptParts: any[] = []

    const basePrompt = customPrompt || `Generate a compelling product description for a tech-focused e-commerce site targeting developers, engineers, and tech professionals in Africa.

Product: ${productName}
${brand ? `Brand: ${brand}` : ''}
${category ? `Category: ${category}` : ''}

Target Audience: Tech professionals, developers, software engineers, and tech enthusiasts in Kenya and Africa.
Style: Professional yet casual, tech-savvy, culturally aware, emphasizing quality and developer culture.

Please provide ONE comprehensive description (150-200 words) that combines product features, benefits, and appeal to the tech community. Make it engaging and highlight why tech professionals would love this product.

Also generate:
- 5-8 relevant tags for the product
- Estimated weight in kg (analyze the image to estimate)
- Estimated dimensions in cm (format: "LxWxH", analyze the image to estimate)

Format your response as JSON:
{
  "description": "Single unified description (150-200 words)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "weight_kg": 0.5,
  "dimensions_cm": "20x15x5",
  "meta_title": "SEO-friendly title",
  "meta_description": "SEO description"
}`

    promptParts.push(basePrompt)

    if (imageUrl) {
      try {
        console.log('Fetching image for AI context:', imageUrl)
        const imageResponse = await fetch(imageUrl)
        if (!imageResponse.ok) throw new Error(`Failed to fetch image: ${imageResponse.statusText}`)

        const arrayBuffer = await imageResponse.arrayBuffer()
        const base64Image = Buffer.from(arrayBuffer).toString('base64')

        promptParts.push({
          inlineData: {
            data: base64Image,
            mimeType: imageResponse.headers.get('content-type') || 'image/jpeg',
          },
        })
        promptParts[0] += "\n\nAnalyze the provided product image to enhance the description with visual details (color, design, material, etc.)."
      } catch (imgError) {
        console.error('Failed to fetch image for AI context:', imgError)
        // Continue without image if fetch fails
      }
    }

    console.log('Sending request to Gemini...')
    const result = await model.generateContent(promptParts)
    const response = await result.response
    const text = response.text()
    console.log('Gemini response:', text)

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
