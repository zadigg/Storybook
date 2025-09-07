'use client'

import { useState, useEffect } from 'react'
import StoryGenerator from '@/components/StoryGenerator'
import Header from '@/components/Header'
import { StoryProvider } from '@/context/StoryContext'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    )
  }

         return (
           <StoryProvider>
             <div className="min-h-screen">
               <StoryGenerator />
             </div>
           </StoryProvider>
         )
}
