import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'npm:@supabase/supabase-js'
import Stripe from 'npm:stripe'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16'
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

Deno.serve(async (req) => {
  try {
    // Verify Stripe signature
    const signature = req.headers.get('stripe-signature')
    if (!signature) throw new Error('Missing Stripe signature')

    const body = await req.text()
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    )

    // Handle payment events
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const orderId = paymentIntent.metadata.order_id
      
      if (!orderId) throw new Error('Missing order_id in payment intent metadata')

      // Validate payment amount matches order total
      const { data: order, error } = await supabase
        .from('orders')
        .select('total_amount, status')
        .eq('id', orderId)
        .single()

      if (error) throw error
      if (!order) throw new Error('Order not found')
      if (order.status !== 'pending') throw new Error('Order already processed')
      if (paymentIntent.amount !== Math.round(order.total_amount * 100)) {
        throw new Error('Payment amount does not match order total')
      }

      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'paid',
          payment_status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (updateError) throw updateError
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error('Webhook error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
