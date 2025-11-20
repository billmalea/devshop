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
