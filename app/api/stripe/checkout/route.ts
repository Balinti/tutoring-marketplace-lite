import { NextRequest, NextResponse } from 'next/server'
import { stripe, isStripeConfigured, getSprintPriceId, getSprintPlusPriceId } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured() || !stripe) {
      return NextResponse.json(
        { error: 'Payment system is not configured. Please check back later.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { priceId, cohortId, successUrl, cancelUrl } = body

    // Validate price ID
    const validPriceIds = [getSprintPriceId(), getSprintPlusPriceId()].filter(Boolean)
    if (!priceId || !validPriceIds.includes(priceId)) {
      return NextResponse.json(
        { error: 'Invalid price ID. This product may not be available yet.' },
        { status: 400 }
      )
    }

    // Get user if authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Build success and cancel URLs
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const finalSuccessUrl = successUrl || `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
    const finalCancelUrl = cancelUrl || `${appUrl}/checkout/cancel`

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      customer_email: user?.email,
      metadata: {
        app_name: 'tutoring-marketplace-lite',
        cohort_id: cohortId || '',
        user_id: user?.id || '',
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
