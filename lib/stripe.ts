import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  : null

export function isStripeConfigured(): boolean {
  return !!stripeSecretKey
}

export function getSprintPriceId(): string | null {
  return process.env.NEXT_PUBLIC_STRIPE_SPRINT_PRICE_ID || null
}

export function getSprintPlusPriceId(): string | null {
  return process.env.NEXT_PUBLIC_STRIPE_SPRINT_PLUS_PRICE_ID || null
}
