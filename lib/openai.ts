import OpenAI from 'openai'

const openaiApiKey = process.env.OPENAI_API_KEY

export const openai = openaiApiKey
  ? new OpenAI({ apiKey: openaiApiKey })
  : null

export function isOpenAIConfigured(): boolean {
  return !!openaiApiKey
}

export interface FeedbackResponse {
  transcript: string
  rubric: {
    fluency: number
    pronunciation: number
    grammar: number
    vocabulary: number
  }
  overall_score: number
  corrections: Array<{
    issue: string
    suggestion: string
    example: string
  }>
  next_prompt: string
  encouragement: string
}

export function getFallbackFeedback(promptText: string): FeedbackResponse {
  return {
    transcript: '[AI transcription unavailable - please review your own recording]',
    rubric: {
      fluency: 0,
      pronunciation: 0,
      grammar: 0,
      vocabulary: 0,
    },
    overall_score: 0,
    corrections: [
      {
        issue: 'AI analysis unavailable',
        suggestion: 'Self-evaluate your response for clarity and accuracy',
        example: 'Listen to your recording and note areas for improvement',
      },
    ],
    next_prompt: promptText,
    encouragement: 'Great job practicing! AI feedback is currently unavailable, but keep up the good work. Self-reflection is also valuable for learning.',
  }
}

export async function transcribeAndAnalyze(
  audioBuffer: Buffer,
  promptText: string,
  language: string = 'en'
): Promise<FeedbackResponse> {
  if (!openai) {
    return getFallbackFeedback(promptText)
  }

  try {
    // Create a Blob from the buffer for the API
    const audioBlob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/webm' })
    const audioFile = new File([audioBlob], 'audio.webm', { type: 'audio/webm' })

    // Transcribe the audio
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: language,
    })

    // Generate feedback using GPT-4
    const feedbackPrompt = 'You are a language learning coach. Analyze the following spoken response to a drill prompt.\n\nDrill Prompt: "' + promptText + '"\nStudent\'s Response (transcribed): "' + transcription.text + '"\n\nProvide feedback in the following JSON format only, no other text:\n{\n  "transcript": "' + transcription.text + '",\n  "rubric": {\n    "fluency": <0-5>,\n    "pronunciation": <0-5>,\n    "grammar": <0-5>,\n    "vocabulary": <0-5>\n  },\n  "overall_score": <0-100>,\n  "corrections": [\n    {\n      "issue": "<specific issue>",\n      "suggestion": "<how to improve>",\n      "example": "<correct example>"\n    }\n  ],\n  "next_prompt": "<suggested follow-up practice prompt>",\n  "encouragement": "<positive, motivating message>"\n}\n\nBe constructive and encouraging while providing specific actionable feedback.'

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful language learning coach. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: feedbackPrompt,
        },
      ],
      temperature: 0.7,
    })

    const responseText = completion.choices[0]?.message?.content || ''

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const feedback = JSON.parse(jsonMatch[0]) as FeedbackResponse
      feedback.transcript = transcription.text
      return feedback
    }

    // Fallback if JSON parsing fails
    return {
      transcript: transcription.text,
      rubric: {
        fluency: 3,
        pronunciation: 3,
        grammar: 3,
        vocabulary: 3,
      },
      overall_score: 60,
      corrections: [],
      next_prompt: promptText,
      encouragement: 'Good effort! Keep practicing to improve.',
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    return getFallbackFeedback(promptText)
  }
}
