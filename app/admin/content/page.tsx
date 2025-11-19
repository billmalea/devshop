'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
    return (
      <div className="space-y-6">
        <div className="h-12 w-64 bg-secondary rounded-lg animate-pulse" />
        <div className="bg-background rounded-2xl border border-border p-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-secondary rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground">Content</h1>
          <p className="text-muted-foreground mt-2">Manage website content and banners</p>
        </div>
        <Button
          onClick={handleSaveContent}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Hero Banner Section */}
      <div className="bg-background rounded-2xl border border-border p-6">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Hero Banner</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Title</label>
            <Input
              type="text"
              value={content.hero_banner.title}
              onChange={(e) => setContent({
                ...content,
                hero_banner: { ...content.hero_banner, title: e.target.value }
              })}
              placeholder="Hero title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Description</label>
            <textarea
              value={content.hero_banner.description}
              onChange={(e) => setContent({
                ...content,
                hero_banner: { ...content.hero_banner, description: e.target.value }
              })}
              rows={4}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Hero description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Image URL</label>
            <Input
              type="text"
              value={content.hero_banner.image_url}
              onChange={(e) => setContent({
                ...content,
                hero_banner: { ...content.hero_banner, image_url: e.target.value }
              })}
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Button Text</label>
              <Input
                type="text"
                value={content.hero_banner.button_text}
                onChange={(e) => setContent({
                  ...content,
                  hero_banner: { ...content.hero_banner, button_text: e.target.value }
                })}
                placeholder="Shop Now"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Button Link</label>
              <Input
                type="text"
                value={content.hero_banner.button_link}
                onChange={(e) => setContent({
                  ...content,
                  hero_banner: { ...content.hero_banner, button_link: e.target.value }
                })}
                placeholder="/products"
              />
            </div>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div className="bg-background rounded-2xl border border-border p-6">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-6">About Us</h2>
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Description</label>
          <textarea
            value={content.about_us.description}
            onChange={(e) => setContent({
              ...content,
              about_us: { description: e.target.value }
            })}
            rows={6}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="About us content..."
          />
        </div>
      </div>
    </div>
  )
}
