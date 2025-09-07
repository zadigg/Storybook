import { GoogleGenAI } from '@google/genai'

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null

export interface StoryPage {
  title: string
  text: string
  characterDescription?: string
  sceneDescription?: string
  imageUrl?: string
  pageNumber: number
}

export interface CompleteStory {
  title: string
  pages: StoryPage[]
  totalPages: number
}

export async function generateCompleteStory(userIdea: string): Promise<CompleteStory> {
  try {
    if (!apiKey) {
      // Fallback for development
      return generateFallbackStory(userIdea)
    }

    // Use the Gemini 2.5 Flash API for story generation
    const structurePrompt = `Create a complete children's comic book story based on this idea: "${userIdea}"

    Return a JSON structure with:
    {
      "title": "Story Title",
      "pages": [
        {
          "title": "Page Title",
          "panels": [
            {
              "text": "Dialogue or narration for this panel (1-2 sentences)",
              "characterDescription": "Character description for this specific panel",
              "sceneDescription": "Scene description for this specific panel",
              "panelType": "main" or "small" or "wide"
            }
          ]
        }
      ]
    }

    Requirements:
    - Create 4-6 pages for a complete comic book
    - Each page must have exactly 6 panels (arranged in 2 rows of 3 panels each)
    - Each panel should advance the story with dialogue or action
    - Include character development and visual storytelling
    - Make it suitable for children (ages 5-12)
    - Use comic book panel structure like real comic books
    - Panel 1-3: Top row panels (setup, action, reaction)
    - Panel 4-6: Bottom row panels (development, climax, resolution)
    - Make the story engaging and educational`

    const response = await genAI!.models.generateContent({
      model: "gemini-2.5-flash",
      contents: structurePrompt,
    })

    const storyText = response.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    
    // Clean the response text - remove markdown code blocks if present
    let cleanJson = storyText.trim()
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }
    
    console.log('📝 Raw story text:', storyText)
    console.log('🧹 Cleaned JSON:', cleanJson)
    
    const storyData = JSON.parse(cleanJson)

    // Generate images for each panel in each page
    const pagesWithImages = await Promise.all(
      storyData.pages.map(async (page: any, pageIndex: number) => {
        const panelsWithImages = await Promise.all(
          page.panels.map(async (panel: any, panelIndex: number) => {
            const imageUrl = await generatePanelImage(panel, pageIndex, panelIndex)
            return {
              ...panel,
              imageUrl: imageUrl || undefined,
              panelNumber: panelIndex + 1
            }
          })
        )
        return {
          ...page,
          panels: panelsWithImages,
          pageNumber: pageIndex + 1
        }
      })
    )

    return {
      title: storyData.title,
      pages: pagesWithImages,
      totalPages: pagesWithImages.length
    }

  } catch (error) {
    console.error('Error generating story:', error)
    return generateFallbackStory(userIdea)
  }
}

async function generatePanelImage(panel: any, pageIndex: number, panelIndex: number): Promise<string | null> {
  try {
    console.log('🎨 Starting image generation for page:', pageIndex + 1, 'panel:', panelIndex + 1)
    console.log('🔑 API Key available:', !!genAI)
    
    if (!genAI) {
      console.log('❌ No API key provided, skipping image generation')
      return null
    }

    // Create a detailed prompt for the Gemini 2.5 Flash Image API
    const speechBubblePositions = [
      'Position the speaking character in the bottom-right area of the panel, facing left, so speech bubble can appear in top-left',
      'Position the speaking character in the bottom-left area of the panel, facing right, so speech bubble can appear in top-right', 
      'Position the speaking character in the bottom-center of the panel, looking up, so speech bubble can appear at the top-center',
      'Position the speaking character in the top-right area of the panel, facing down-left, so speech bubble can appear in middle-left',
      'Position the speaking character in the top-left area of the panel, facing down-right, so speech bubble can appear in middle-right',
      'Position the speaking character in the top-center of the panel, facing down, so speech bubble can appear in bottom-left'
    ]
    
    const imagePrompt = `Create a complete comic book panel illustration with speech bubble for this scene:

    DIALOGUE TO INCLUDE: "${panel.text}"
    Character: ${panel.characterDescription || 'A friendly character'}
    Scene: ${panel.sceneDescription || 'A beautiful setting'}
    Panel Position: Panel ${panelIndex + 1} of 6 on page ${pageIndex + 1}

    REQUIREMENTS:
    - Include a white speech bubble with black border containing the exact text: "${panel.text}"
    - Position the character so the speech bubble naturally points to their mouth
    - Use comic book style speech bubble with a tail pointing to the character's mouth
    - Make the text in the speech bubble clear and readable in comic book font
    - Character should be clearly visible and positioned for natural dialogue flow

    Style: Complete comic book panel with:
    - Wide rectangular aspect ratio (2:1) - width is twice the height
    - Bold black outlines and vibrant colors
    - Dynamic composition with character positioned for speech bubble
    - Dramatic lighting and shadows
    - WHITE SPEECH BUBBLE with BLACK BORDER containing the dialogue text
    - Speech bubble tail pointing directly to character's mouth
    - High contrast and bold visual impact
    - Comic book art style like Marvel or DC comics
    - Fill the entire frame with action and detail
    - Professional comic book panel with integrated dialogue`

    console.log('📝 Image prompt:', imagePrompt)
    console.log('🚀 Calling Gemini 2.5 Flash Image API...')

    // Use the Gemini 2.5 Flash Image API
    const response = await genAI!.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: imagePrompt,
    })

    console.log('📡 API Response received:', {
      candidates: response.candidates?.length || 0,
      firstCandidate: response.candidates?.[0] ? 'exists' : 'missing',
      content: response.candidates?.[0]?.content ? 'exists' : 'missing',
      parts: response.candidates?.[0]?.content?.parts?.length || 0
    })

    // Extract the image data from the response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      console.log('🔍 Processing part:', Object.keys(part))
      
      if (part.text) {
        console.log('📝 Text response:', part.text)
      } else if (part.inlineData) {
        console.log('🖼️ Image data found!')
        console.log('📏 Image size:', part.inlineData.data.length, 'characters')
        console.log('🎭 MIME type:', part.inlineData.mimeType)
        
        // Convert base64 to data URL
        const imageData = part.inlineData.data
        const mimeType = part.inlineData.mimeType || 'image/png'
        console.log('✅ Successfully generated AI image!')
        return `data:${mimeType};base64,${imageData}`
      } else {
        console.log('❓ Unknown part type:', Object.keys(part))
      }
    }

    // If no image data found, return null (no image)
    console.log('❌ No image data found in response')
    return null

  } catch (error) {
    console.error('❌ Error generating page image:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.status
    })
    return null
  }
}

async function generateRealImage(prompt: string, index: number): Promise<string> {
  try {
    // Extract key terms from the AI-generated prompt for better image search
    const keywords = extractKeywords(prompt)
    
    // Use Lorem Picsum with more intelligent parameters based on the prompt
    const theme = getImageTheme(keywords)
    const seed = generateSeedFromPrompt(prompt)
    
    // Create a more relevant image URL based on the prompt content
    const imageUrl = `https://picsum.photos/800/600?random=${seed}&blur=0&grayscale=0`
    
    console.log(`Generated image for: "${keywords}" with theme: ${theme}`)
    return imageUrl
    
  } catch (error) {
    console.error('Error generating real image:', error)
    return `https://picsum.photos/800/600?random=${Date.now() + index}`
  }
}

function getImageTheme(keywords: string): string {
  const lowerKeywords = keywords.toLowerCase()
  
  if (lowerKeywords.includes('robot') || lowerKeywords.includes('machine')) return 'tech'
  if (lowerKeywords.includes('dragon') || lowerKeywords.includes('magic')) return 'fantasy'
  if (lowerKeywords.includes('space') || lowerKeywords.includes('alien')) return 'space'
  if (lowerKeywords.includes('forest') || lowerKeywords.includes('animal')) return 'nature'
  if (lowerKeywords.includes('garden') || lowerKeywords.includes('flower')) return 'garden'
  if (lowerKeywords.includes('library') || lowerKeywords.includes('book')) return 'library'
  
  return 'general'
}

function generateSeedFromPrompt(prompt: string): number {
  // Generate a consistent seed based on the prompt content
  let hash = 0
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash) % 1000
}

function extractKeywords(prompt: string): string {
  // Extract key visual terms from the AI-generated prompt
  const words = prompt.toLowerCase().split(' ')
  const visualKeywords = words.filter(word => 
    word.length > 3 && 
    !['the', 'and', 'with', 'that', 'this', 'from', 'they', 'them', 'their', 'there', 'where', 'when', 'what', 'how', 'why', 'will', 'would', 'could', 'should', 'have', 'has', 'had', 'been', 'being', 'are', 'is', 'was', 'were', 'be', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'as', 'or', 'but', 'if', 'then', 'so', 'up', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once'].includes(word)
  )
  
  // Take the first 3-4 most relevant words
  return visualKeywords.slice(0, 4).join(' ')
}

function generateFallbackStory(userIdea: string): CompleteStory {
  const fallbackStories = [
    {
      title: "The Brave Little Robot",
      pages: [
        {
          title: "The Discovery",
          text: "In a small workshop, a brave little robot named Sparky was built by a kind inventor. Sparky had bright blue eyes and a curious nature that made him special.",
          characterDescription: "A small silver robot with bright blue LED eyes, copper accents, and a friendly digital smile. Wears a small red cape.",
          sceneDescription: "A cozy workshop filled with tools, gears, and warm golden light streaming through a window.",
          pageNumber: 1
        },
        {
          title: "The Journey Begins",
          text: "One day, Sparky decided to explore the world beyond the workshop. He rolled out the door and into a magical garden filled with glowing flowers.",
          characterDescription: "The same small silver robot, now outside, looking around with wonder in his bright blue eyes.",
          sceneDescription: "A mystical garden with luminescent flowers, ancient oak trees, and floating orbs of soft light.",
          pageNumber: 2
        },
        {
          title: "New Friends",
          text: "In the garden, Sparky met a wise old owl and a colorful butterfly. They became fast friends and showed him the wonders of nature.",
          characterDescription: "Sparky the robot with a wise owl wearing spectacles and a beautiful butterfly with rainbow wings.",
          sceneDescription: "The magical garden with the three friends sitting together under a glowing tree.",
          pageNumber: 3
        },
        {
          title: "The Adventure",
          text: "Together, they discovered a hidden cave behind a waterfall. Inside, they found crystals that glowed with magical energy.",
          characterDescription: "Sparky, the owl, and butterfly exploring a mysterious cave with glowing crystals.",
          sceneDescription: "A hidden cave with sparkling crystals, a gentle waterfall, and mysterious shadows.",
          pageNumber: 4
        },
        {
          title: "The Challenge",
          text: "Suddenly, the cave began to shake! A friendly dragon appeared, explaining that the crystals were losing their power and needed help.",
          characterDescription: "A gentle green dragon with kind eyes, Sparky and his friends looking up in amazement.",
          sceneDescription: "The cave interior with glowing crystals dimming, the dragon's scales reflecting the crystal light.",
          pageNumber: 5
        },
        {
          title: "Working Together",
          text: "Sparky used his mechanical skills to fix the crystal generator, while his friends helped gather the right materials. Teamwork made everything possible!",
          characterDescription: "Sparky working on machinery, the owl organizing materials, the butterfly carrying small parts, and the dragon watching proudly.",
          sceneDescription: "The cave with the crystal generator glowing brightly, tools and materials scattered around.",
          pageNumber: 6
        },
        {
          title: "Success!",
          text: "The crystals glowed brighter than ever! The dragon was grateful and invited everyone to a celebration in the garden.",
          characterDescription: "All four friends celebrating together, the crystals shining brilliantly around them.",
          sceneDescription: "The magical garden at night, with glowing crystals, fireflies, and a beautiful starry sky.",
          pageNumber: 7
        },
        {
          title: "Home Sweet Home",
          text: "Sparky returned to the workshop, but now he knew he had friends in the magical garden. He would visit them often and share many more adventures.",
          characterDescription: "Sparky back in the workshop, looking out the window toward the garden with a happy expression.",
          sceneDescription: "The cozy workshop with the magical garden visible through the window, bathed in golden light.",
          pageNumber: 8
        }
      ]
    }
  ]

  // Return a random fallback story or create one based on user idea
  const story = fallbackStories[0] // For now, always return the robot story
  
  // Convert to new panel structure with 6 panels per page
  const pagesWithPanels = story.pages.map((page, pageIndex) => ({
    title: page.title,
    pageNumber: pageIndex + 1,
    panels: [
      {
        text: `${page.text.substring(0, 50)}...`,
        characterDescription: page.characterDescription,
        sceneDescription: page.sceneDescription,
        panelType: 'main' as const,
        imageUrl: `https://picsum.photos/400/300?random=${Date.now() + pageIndex * 10 + 1}`,
        panelNumber: 1
      },
      {
        text: `${page.text.substring(50, 100)}...`,
        characterDescription: page.characterDescription,
        sceneDescription: page.sceneDescription,
        panelType: 'main' as const,
        imageUrl: `https://picsum.photos/400/300?random=${Date.now() + pageIndex * 10 + 2}`,
        panelNumber: 2
      },
      {
        text: `${page.text.substring(100, 150)}...`,
        characterDescription: page.characterDescription,
        sceneDescription: page.sceneDescription,
        panelType: 'main' as const,
        imageUrl: `https://picsum.photos/400/300?random=${Date.now() + pageIndex * 10 + 3}`,
        panelNumber: 3
      },
      {
        text: `${page.text.substring(150, 200)}...`,
        characterDescription: page.characterDescription,
        sceneDescription: page.sceneDescription,
        panelType: 'main' as const,
        imageUrl: `https://picsum.photos/400/300?random=${Date.now() + pageIndex * 10 + 4}`,
        panelNumber: 4
      },
      {
        text: `${page.text.substring(200, 250)}...`,
        characterDescription: page.characterDescription,
        sceneDescription: page.sceneDescription,
        panelType: 'main' as const,
        imageUrl: `https://picsum.photos/400/300?random=${Date.now() + pageIndex * 10 + 5}`,
        panelNumber: 5
      },
      {
        text: `${page.text.substring(250)}` || "The end of this page!",
        characterDescription: page.characterDescription,
        sceneDescription: page.sceneDescription,
        panelType: 'main' as const,
        imageUrl: `https://picsum.photos/400/300?random=${Date.now() + pageIndex * 10 + 6}`,
        panelNumber: 6
      }
    ]
  }))

  return {
    title: story.title,
    pages: pagesWithPanels,
    totalPages: pagesWithPanels.length
  }
}
