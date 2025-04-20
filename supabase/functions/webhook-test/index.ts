import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'npm:@supabase/supabase-js'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

Deno.serve(async (req) => {
  try {
    // Log incoming request
    const body = await req.text()
    const headers = Object.fromEntries(req.headers.entries())
    
    await supabase
      .from('webhook_logs')
      .insert({
        method: req.method,
        headers: JSON.stringify(headers),
        body,
        received_at: new Date().toISOString()
      })

    // Validate required headers
    if (!headers['x-webhook-secret'] || headers['x-webhook-secret'] !== Deno.env.get('WEBHOOK_SECRET')) {
      throw new Error('Invalid webhook secret')
    }

    // Parse and validate payload
    let payload
    try {
      payload = JSON.parse(body)
    } catch {
      throw new Error('Invalid JSON payload')
    }

    // Test different response types based on payload
    if (payload.test_type === 'success') {
      return new Response(JSON.stringify({ status: 'success', data: payload }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } else if (payload.test_type === 'error') {
      return new Response(JSON.stringify({ error: 'Test error response' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    } else if (payload.test_type === 'delay') {
      await new Promise(resolve => setTimeout(resolve, payload.delay_ms || 1000))
      return new Response(JSON.stringify({ status: 'delayed_response' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Default response
    return new Response(JSON.stringify({ status: 'received' }), {
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
