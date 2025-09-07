import { GoogleGenAI } from '@google/genai'

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null

export interface ImageGenerationOptions {
  prompt: string
  characterDescription?: string
  sceneDescription?: string
  style?: 'cartoon' | 'realistic' | 'watercolor' | 'sketch'
}

export async function generateImage(options: ImageGenerationOptions): Promise<string | null> {
  try {
    const { prompt, characterDescription, sceneDescription, style = 'cartoon' } = options
    
    // If no API key, return null (no image)
    if (!genAI) {
      console.log('No API key provided, skipping image generation')
      return null
    }
    
    // Build a comprehensive prompt for image generation
    let fullPrompt = `Create a beautiful children's storybook illustration. `
    
    if (characterDescription) {
      fullPrompt += `Character: ${characterDescription}. `
    }
    
    if (sceneDescription) {
      fullPrompt += `Scene: ${sceneDescription}. `
    }
    
    fullPrompt += `Additional details: ${prompt}. `
    fullPrompt += `Style: ${style}. Make it colorful, engaging, and suitable for children. `

    console.log('Generating image with prompt:', fullPrompt)

    // Use the Gemini 2.5 Flash Image API
    const response = await genAI!.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: fullPrompt,
    })

    // Extract the image data from the response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        // Convert base64 to data URL
        const imageData = part.inlineData.data
        const mimeType = part.inlineData.mimeType || 'image/png'
        console.log('Successfully generated AI image!')
        return `data:${mimeType};base64,${imageData}`
      }
    }

    // If no image data found, return null (no image)
    console.log('No image data found in response')
    return null
    
  } catch (error) {
    console.error('Error generating image:', error)
    return null
  }
}

export async function generateCharacterDescription(prompt: string): Promise<string> {
  try {
    if (!genAI) {
      console.log('No API key provided, using fallback character description')
      return `A character based on: ${prompt}. Add more details about appearance, clothing, and personality.`
    }

    const characterPrompt = `Create a detailed character description for a children's storybook based on this prompt: "${prompt}". 
    Include physical appearance, clothing, personality traits, and distinctive features. 
    Keep it concise but descriptive for consistent illustration generation.`

    const response = await genAI!.models.generateContent({
      model: "gemini-2.5-flash",
      contents: characterPrompt,
    })

    return response.candidates?.[0]?.content?.parts?.[0]?.text || `A character based on: ${prompt}. Add more details about appearance, clothing, and personality.`
  } catch (error) {
    console.error('Error generating character description:', error)
    return `A character based on: ${prompt}. Add more details about appearance, clothing, and personality.`
  }
}

export async function enhancePrompt(originalPrompt: string, context?: string): Promise<string> {
  try {
    if (!genAI) {
      console.log('No API key provided, using fallback prompt enhancement')
      return `${originalPrompt}. Add more visual details, lighting, and atmosphere.`
    }

    const enhancementPrompt = `Enhance this image generation prompt for a children's storybook: "${originalPrompt}". 
    ${context ? `Context: ${context}` : ''}
    Make it more descriptive, visual, and suitable for AI image generation. 
    Include details about lighting, composition, and visual style.`

    const response = await genAI!.models.generateContent({
      model: "gemini-2.5-flash",
      contents: enhancementPrompt,
    })

    return response.candidates?.[0]?.content?.parts?.[0]?.text || `${originalPrompt}. Add more visual details, lighting, and atmosphere.`
  } catch (error) {
    console.error('Error enhancing prompt:', error)
    return `${originalPrompt}. Add more visual details, lighting, and atmosphere.`
  }
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
