'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/client'
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'

interface NewArrival {
  id: string
  image_url: string
  title?: string
  description?: string
  link_url?: string
  display_order: number
  is_active: boolean
}

export default function ContentPage() {
  const [newArrivals, setNewArrivals] = useState<NewArrival[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<number | null>(null)
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    fetchNewArrivals()
  }, [])

  const fetchNewArrivals = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('new_arrivals')
        .select('*')
        .order('display_order')

      if (error) throw error

      // Ensure we always have 3 slots
      const arrivals = [...(data || [])]
      while (arrivals.length < 3) {
        arrivals.push({
          id: '',
          image_url: '',
          display_order: arrivals.length,
          is_active: true
        })
      }
      setNewArrivals(arrivals.slice(0, 3))
    } catch (error) {
      console.error('Failed to fetch new arrivals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (index: number, file: File) => {
    if (!file) return

    setUploading(index)
    try {
      const supabase = createClient()

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('new-arrivals')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('new-arrivals')
        .getPublicUrl(filePath)

      // Update state with new image URL
      const updated = [...newArrivals]
      updated[index] = {
        ...updated[index],
        image_url: publicUrl
      }
      setNewArrivals(updated)

      alert('Image uploaded successfully!')
    } catch (error: any) {
      console.error('Upload error:', error)
      alert(`Failed to upload image: ${error.message}`)
    } finally {
      setUploading(null)
    }
  }

  const handleSave = async (index: number) => {
    const arrival = newArrivals[index]

    if (!arrival.image_url) {
      alert('Please upload an image first')
      return
    }

    try {
      const supabase = createClient()

      const dataToSave = {
        image_url: arrival.image_url,
        title: arrival.title || null,
        description: arrival.description || null,
        link_url: arrival.link_url || null,
        display_order: index,
        is_active: true
      }

      if (arrival.id) {
        // Update existing
        const { error } = await supabase
          .from('new_arrivals')
          .update(dataToSave)
          .eq('id', arrival.id)

        if (error) throw error
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('new_arrivals')
          .insert([dataToSave])
          .select()
          .single()

        if (error) throw error

        // Update local state with new ID
        const updated = [...newArrivals]
        updated[index] = { ...updated[index], id: data.id }
        setNewArrivals(updated)
      }

      alert('Saved successfully!')
      await fetchNewArrivals()
    } catch (error: any) {
      console.error('Save error:', error)
      alert(`Failed to save: ${error.message}`)
    }
  }

  const handleDelete = async (index: number) => {
    const arrival = newArrivals[index]

    if (!arrival.id) {
      // Just clear the local state
      const updated = [...newArrivals]
      updated[index] = {
        id: '',
        image_url: '',
        display_order: index,
        is_active: true
      }
      setNewArrivals(updated)
      return
    }

    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const supabase = createClient()

      // Delete from database
      const { error } = await supabase
        .from('new_arrivals')
        .delete()
        .eq('id', arrival.id)

      if (error) throw error

      // Delete image from storage if exists
      if (arrival.image_url) {
        const fileName = arrival.image_url.split('/').pop()
        if (fileName) {
          await supabase.storage
            .from('new-arrivals')
            .remove([fileName])
        }
      }

      alert('Deleted successfully!')
      await fetchNewArrivals()
    } catch (error: any) {
      console.error('Delete error:', error)
      alert(`Failed to delete: ${error.message}`)
    }
  }

  const updateField = (index: number, field: keyof NewArrival, value: any) => {
    const updated = [...newArrivals]
    updated[index] = { ...updated[index], [field]: value }
    setNewArrivals(updated)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-64 bg-secondary rounded-lg animate-pulse" />
        <div className="bg-background rounded-2xl border border-border p-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-secondary rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-heading font-bold text-foreground">Content Management</h1>
        <p className="text-muted-foreground mt-2">Manage hero images for web and mobile</p>
      </div>

      {/* New Arrivals Section */}
      <div className="bg-background rounded-2xl border border-border p-6">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-2">New Arrivals / Hero Images</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Upload up to 3 images for the hero section (web) and new arrivals slider (mobile)
        </p>

        <div className="space-y-6">
          {newArrivals.map((arrival, index) => (
            <div key={index} className="border border-border rounded-lg p-6">
              <div className="flex items-start gap-6">
                {/* Image Preview/Upload */}
                <div className="flex-shrink-0">
                  <div className="w-48 h-64 border-2 border-dashed border-border rounded-lg overflow-hidden bg-secondary/20 relative">
                    {arrival.image_url ? (
                      <Image
                        src={arrival.image_url}
                        alt={arrival.title || `Slot ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <input
                    ref={el => { fileInputRefs.current[index] = el }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(index, file)
                    }}
                  />
                  <Button
                    onClick={() => fileInputRefs.current[index]?.click()}
                    disabled={uploading === index}
                    className="w-full mt-2"
                    variant="outline"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading === index ? 'Uploading...' : arrival.image_url ? 'Replace' : 'Upload'}
                  </Button>
                </div>

                {/* Form Fields */}
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Title (Optional)
                    </label>
                    <Input
                      type="text"
                      value={arrival.title || ''}
                      onChange={(e) => updateField(index, 'title', e.target.value)}
                      placeholder="New Collection"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Description (Optional)
                    </label>
                    <Input
                      type="text"
                      value={arrival.description || ''}
                      onChange={(e) => updateField(index, 'description', e.target.value)}
                      placeholder="Check out our latest products"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Link URL (Optional)
                    </label>
                    <Input
                      type="text"
                      value={arrival.link_url || ''}
                      onChange={(e) => updateField(index, 'link_url', e.target.value)}
                      placeholder="/products"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleSave(index)}
                      disabled={!arrival.image_url}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Save
                    </Button>
                    {(arrival.id || arrival.image_url) && (
                      <Button
                        onClick={() => handleDelete(index)}
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
