import Link from "next/link"
import { Github, Twitter, Instagram, Mail, MapPin, Phone } from 'lucide-react'
import { Button } from "@/components/ui/button"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-black text-white">
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5 mb-12">
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2 font-bold text-lg">
              <span className="text-primary">&lt;</span>
              <span>DevShop</span>
              <span className="text-primary">/&gt;</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Premium developer merchandise for the Kenyan tech community. Quality products delivered fast.
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Mail className="h-4 w-4" />
                <a href="mailto:support@devshop.ke" className="hover:text-white transition-colors">
                  support@devshop.ke
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Phone className="h-4 w-4" />
                <a href="tel:+254712345678" className="hover:text-white transition-colors">
                  +254 712 345 678
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <MapPin className="h-4 w-4" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-bold text-white uppercase tracking-wider">Shop</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/products" className="text-white/70 hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/products?category=hoodies" className="text-white/70 hover:text-white transition-colors">Hoodies</Link></li>
              <li><Link href="/products?category=stickers" className="text-white/70 hover:text-white transition-colors">Stickers</Link></li>
              <li><Link href="/products?category=sweatshirts" className="text-white/70 hover:text-white transition-colors">Sweatshirts</Link></li>
              <li><Link href="/products?category=headbands" className="text-white/70 hover:text-white transition-colors">Headbands</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-bold text-white uppercase tracking-wider">Support</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/support/contact-us" className="text-white/70 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/support/faqs" className="text-white/70 hover:text-white transition-colors">FAQs</Link></li>
              <li><Link href="/support/shipping-info" className="text-white/70 hover:text-white transition-colors">Shipping Info</Link></li>
              <li><Link href="/support/returns-refunds" className="text-white/70 hover:text-white transition-colors">Returns & Refunds</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-bold text-white uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/legal/terms-of-service" className="text-white/70 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/legal/privacy-policy" className="text-white/70 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/cookie-policy" className="text-white/70 hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link href="/legal/disclaimer" className="text-white/70 hover:text-white transition-colors">Disclaimer</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-bold text-white uppercase tracking-wider">Connect</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-white/70">Subscribe to our newsletter</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 px-3 py-2 text-xs border border-white/20 rounded-md focus:outline-none focus:ring-1 focus:ring-white bg-white/5 text-white placeholder:text-white/50"
                  />
                  <Button size="sm" className="text-xs bg-white text-black hover:bg-white/90">
                    Subscribe
                  </Button>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-white/70 mb-3">Follow us</p>
                <div className="flex gap-3">
                  <Button asChild variant="outline" size="icon" className="h-8 w-8 border-white/20 hover:bg-white hover:text-black">
                    <a href="https://twitter.com/devshop" target="_blank" rel="noopener noreferrer">
                      <Twitter className="h-4 w-4" />
                      <span className="sr-only">Twitter</span>
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="icon" className="h-8 w-8 border-white/20 hover:bg-white hover:text-black">
                    <a href="https://instagram.com/devshop" target="_blank" rel="noopener noreferrer">
                      <Instagram className="h-4 w-4" />
                      <span className="sr-only">Instagram</span>
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="icon" className="h-8 w-8 border-white/20 hover:bg-white hover:text-black">
                    <a href="https://github.com/devshop" target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                      <span className="sr-only">GitHub</span>
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/20 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold text-white mb-2">Payment Methods</p>
              <div className="flex gap-3 flex-wrap">
                <div className="px-3 py-1 bg-white/10 rounded text-xs font-medium text-white">M-Pesa</div>
                <div className="px-3 py-1 bg-white/10 rounded text-xs font-medium text-white">Credit/Debit Card</div>
                <div className="px-3 py-1 bg-white/10 rounded text-xs font-medium text-white">Pickup Mtaani</div>
              </div>
            </div>
            <div className="md:text-right">
              <p className="text-xs text-white/70">Secure transactions • Fast delivery • Customer support 24/7</p>
            </div>
          </div>
          
          <div className="border-t border-white/20 pt-6 text-center text-xs text-white/60">
            <p>&copy; {new Date().getFullYear()} DevShop Kenya. All rights reserved. Made with ♥ for developers.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
