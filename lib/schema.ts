import { z } from 'zod'

// Feedback schema for AI responses
export const rubricSchema = z.object({
  fluency: z.number().min(0).max(5),
  pronunciation: z.number().min(0).max(5),
  grammar: z.number().min(0).max(5),
  vocabulary: z.number().min(0).max(5),
})

export const correctionSchema = z.object({
  issue: z.string(),
  suggestion: z.string(),
  example: z.string(),
})

export const feedbackResponseSchema = z.object({
  transcript: z.string(),
  rubric: rubricSchema,
  overall_score: z.number().min(0).max(100),
  corrections: z.array(correctionSchema),
  next_prompt: z.string(),
  encouragement: z.string(),
})

export type FeedbackResponse = z.infer<typeof feedbackResponseSchema>

// Local progress schema for migration
export const localDrillSubmissionSchema = z.object({
  id: z.string(),
  date: z.string(),
  prompt: z.string(),
  audioBlob: z.string().optional(),
  transcript: z.string(),
  feedback: z.object({
    rubric: rubricSchema,
    overall_score: z.number(),
    corrections: z.array(correctionSchema),
    encouragement: z.string(),
  }),
  createdAt: z.string(),
})

export const localProgressSchema = z.object({
  drillSubmissions: z.array(localDrillSubmissionSchema),
  streak: z.object({
    current: z.number(),
    longest: z.number(),
    lastDrillDate: z.string().nullable(),
  }),
  totalDrillsCompleted: z.number(),
  migrated: z.boolean(),
})

export type LocalProgress = z.infer<typeof localProgressSchema>

// Checkout session schema
export const checkoutRequestSchema = z.object({
  priceId: z.string(),
  cohortId: z.string().uuid().optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
})

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>
