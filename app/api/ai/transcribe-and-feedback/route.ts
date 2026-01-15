import { NextRequest, NextResponse } from 'next/server'
import { transcribeAndAnalyze, getFallbackFeedback, isOpenAIConfigured } from '@/lib/openai'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File | null
    const prompt = formData.get('prompt') as string | null
    const language = (formData.get('language') as string) || 'en'

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt' },
        { status: 400 }
      )
    }

    // If no OpenAI key, return fallback
    if (!isOpenAIConfigured()) {
      console.log('OpenAI not configured, returning fallback feedback')
      return NextResponse.json(getFallbackFeedback(prompt))
    }

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Missing audio file' },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Get language code (first 2 characters)
    const langCode = language.toLowerCase().substring(0, 2)

    // Process with OpenAI
    const feedback = await transcribeAndAnalyze(buffer, prompt, langCode)

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('AI transcribe-and-feedback error:', error)

    // Return fallback on error
    const prompt = 'your speaking exercise'
    return NextResponse.json(getFallbackFeedback(prompt))
  }
}
