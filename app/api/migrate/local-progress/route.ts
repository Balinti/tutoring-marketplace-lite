import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { localProgressSchema } from '@/lib/schema'

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const parseResult = localProgressSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid progress data', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const progress = parseResult.data

    // Use service client for database operations
    const serviceSupabase = await createServiceClient()

    // Migrate drill submissions
    const migratedSubmissions: string[] = []

    for (const submission of progress.drillSubmissions) {
      try {
        // First, ensure we have a drill record (or create a local one)
        // For simplicity, we'll create drill_submissions with a null drill_id
        // or reference a default drill

        const { error: submissionError } = await serviceSupabase
          .from('drill_submissions')
          .upsert({
            user_id: user.id,
            drill_id: null, // Local submissions don't have a drill_id
            transcript: submission.transcript,
            feedback_json: submission.feedback,
            score_json: {
              overall: submission.feedback.overall_score,
              rubric: submission.feedback.rubric,
            },
            created_at: submission.createdAt,
          }, {
            onConflict: 'user_id,created_at',
            ignoreDuplicates: true,
          })

        if (!submissionError) {
          migratedSubmissions.push(submission.id)
        }
      } catch (err) {
        console.error('Error migrating submission:', err)
      }
    }

    // Update user profile with streak info if needed
    try {
      await serviceSupabase
        .from('profiles')
        .update({
          // Could store streak in a JSON column or separate table
          // For now, we just acknowledge the migration
        })
        .eq('id', user.id)
    } catch (err) {
      console.error('Error updating profile:', err)
    }

    return NextResponse.json({
      success: true,
      migratedCount: migratedSubmissions.length,
      totalSubmissions: progress.drillSubmissions.length,
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Failed to migrate progress' },
      { status: 500 }
    )
  }
}
