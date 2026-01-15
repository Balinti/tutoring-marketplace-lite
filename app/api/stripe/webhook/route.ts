import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    let event: Stripe.Event

    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (webhookSecret && signature && stripe) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        )
      }
    } else {
      // Parse event without verification (development mode)
      event = JSON.parse(body) as Stripe.Event
    }

    // Get Supabase service client
    const supabase = await createServiceClient()

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Only process if from our app
        if (session.metadata?.app_name !== 'tutoring-marketplace-lite') {
          console.log('Ignoring checkout session from different app')
          break
        }

        const userId = session.metadata?.user_id
        const cohortId = session.metadata?.cohort_id

        if (userId && cohortId) {
          // Create enrollment record
          await supabase.from('cohort_enrollments').upsert({
            cohort_id: cohortId,
            user_id: userId,
            status: 'active',
            stripe_checkout_session_id: session.id,
            paid_at: new Date().toISOString(),
          }, {
            onConflict: 'cohort_id,user_id',
          })

          console.log('Enrolled user ' + userId + ' in cohort ' + cohortId)
        }

        // Create or update subscription record for tracking
        if (userId) {
          await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: session.customer as string,
            status: 'active',
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          })
        }

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        // Get current period end from items (Stripe API v2023+)
        const currentPeriodEnd = subscription.items?.data?.[0]?.current_period_end

        // Update subscription status
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            stripe_subscription_id: subscription.id,
            current_period_end: currentPeriodEnd
              ? new Date(currentPeriodEnd * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', subscription.customer as string)

        if (error) {
          console.error('Error updating subscription:', error)
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // Mark subscription as canceled
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Error canceling subscription:', error)
        }

        break
      }

      default:
        console.log('Unhandled event type: ' + event.type)
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    // Still return 200 to avoid retries for non-critical errors
    return NextResponse.json({ received: true, error: 'Processing error' })
  }
}
