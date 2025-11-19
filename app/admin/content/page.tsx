'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { Save } from 'lucide-react'

interface ContentRow {
  section: string
  title?: string
  description?: string
  image_url?: string
  button_text?: string
  button_link?: string
}

export default function ContentPage() {
  const [content, setContent] = useState({
    hero_banner: {
      title: '',
      description: '',
      image_url: '',
      button_text: '',
      button_link: '',
    },
    about_us: {
      description: '',
    },
    faqs: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('content')
        .select('*')

      if (error) throw error

      // Parse content data
      const parsedContent = {
        hero_banner: { title: '', description: '', image_url: '', button_text: '', button_link: '' },
        about_us: { description: '' },
        faqs: [],
      }
      data?.forEach((item: ContentRow) => {
        if (item.section === 'hero_banner') {
          parsedContent.hero_banner = {
            title: item.title ?? '',
            description: item.description ?? '',
            image_url: item.image_url ?? '',
            button_text: item.button_text ?? '',
            button_link: item.button_link ?? '',
          }
        }
        if (item.section === 'about_us') {
          parsedContent.about_us = { description: item.description ?? '' }
        }
      })

      setContent(parsedContent)
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveContent = async () => {
    setSaving(true)
    try {
      const supabase = createClient()

      // Update hero banner
      await supabase
        .from('content')
        .upsert([
          {
            section: 'hero_banner',
            title: content.hero_banner.title,
            description: content.hero_banner.description,
            image_url: content.hero_banner.image_url,
            button_text: content.hero_banner.button_text,
            button_link: content.hero_banner.button_link,
          }
        ], { onConflict: 'section' })

      // Update about us
      await supabase
        .from('content')
        .upsert([
          {
            section: 'about_us',
            description: content.about_us.description,
          }
        ], { onConflict: 'section' })

      alert('Content saved successfully!')
    } catch (error) {
      console.error('Failed to save content:', error)
      alert('Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading content...</div>
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Content Management</h1>
        <button
          onClick={handleSaveContent}
          disabled={saving}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Hero Banner Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Hero Banner</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={content.hero_banner.title}
              onChange={(e) => setContent({
                ...content,
                hero_banner: { ...content.hero_banner, title: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Hero title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={content.hero_banner.description}
              onChange={(e) => setContent({
                ...content,
                hero_banner: { ...content.hero_banner, description: e.target.value }
              })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Hero description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Image URL</label>
            <input
              type="text"
              value={content.hero_banner.image_url}
              onChange={(e) => setContent({
                ...content,
                hero_banner: { ...content.hero_banner, image_url: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Button Text</label>
              <input
                type="text"
                value={content.hero_banner.button_text}
                onChange={(e) => setContent({
                  ...content,
                  hero_banner: { ...content.hero_banner, button_text: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Shop Now"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Button Link</label>
              <input
                type="text"
                value={content.hero_banner.button_link}
                onChange={(e) => setContent({
                  ...content,
                  hero_banner: { ...content.hero_banner, button_link: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="/products"
              />
            </div>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">About Us</h2>
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={content.about_us.description}
            onChange={(e) => setContent({
              ...content,
              about_us: { description: e.target.value }
            })}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="About us content..."
          />
        </div>
      </div>
    </div>
  )
}
