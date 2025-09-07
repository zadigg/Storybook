import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Interactive Storybook Creator',
  description: 'Create multi-panel stories with AI-generated images using Gemini 2.5 Flash',
  keywords: 'storybook, AI, image generation, storytelling, creative writing',
  authors: [{ name: 'Nano Banana Hackathon' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
          {children}
        </div>
      </body>
    </html>
  )
}
