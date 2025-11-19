import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CartProvider } from '@/components/cart-provider'
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] });
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: 'DevShop - Developer Merchandise',
  description: 'Premium developer merchandise for the Kenyan market. Hoodies, stickers, and more.',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${outfit.variable} antialiased min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>
            <SiteHeader />
            <main className="flex-1 relative">
              {children}
            </main>
            <SiteFooter />
            <Toaster />
          </CartProvider>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
