import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin } from 'lucide-react'

export const metadata = {
  title: 'Contact Us - DevShop',
  description: 'Get in touch with our support team',
}

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-black mb-6">Contact Us</h1>
          <p className="text-lg text-black/70 mb-12">
            Have questions? We're here to help! Reach out to our support team.
          </p>

          <div className="space-y-8 mb-12">
            <div className="flex gap-4">
              <Mail className="h-6 w-6 text-black flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-black mb-2">Email</h3>
                <a href="mailto:support@devshop.ke" className="text-black/70 hover:text-black">
                  support@devshop.ke
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <Phone className="h-6 w-6 text-black flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-black mb-2">Phone</h3>
                <a href="tel:+254712345678" className="text-black/70 hover:text-black">
                  +254 712 345 678
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <MapPin className="h-6 w-6 text-black flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-black mb-2">Location</h3>
                <p className="text-black/70">Nairobi, Kenya</p>
              </div>
            </div>
          </div>

          <form className="space-y-6 bg-gray-50 p-8 rounded-lg border border-black/10">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-black/20 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-black/20 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Your email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black mb-2">Message</label>
              <textarea
                className="w-full px-4 py-2 border border-black/20 rounded-md focus:outline-none focus:ring-2 focus:ring-black h-32"
                placeholder="Your message"
              />
            </div>

            <Button className="w-full bg-black text-white hover:bg-black/90">Send Message</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
