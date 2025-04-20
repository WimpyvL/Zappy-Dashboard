import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface OrderItem {
  product_id: string
  product_dose_id?: string
  quantity: number
}

interface OrderData {
  patient_id: string
  items: OrderItem[]
  shipping_address?: string
  notes?: string
}

serve(async (req: Request) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { data } = await req.json()
    
    // Basic validation
    if (!data || typeof data !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400 }
      )
    }

    const orderData = data as OrderData

    // Required fields validation
    if (!orderData.patient_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: patient_id' }),
        { status: 400 }
      )
    }

    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Order must contain at least one item' }),
        { status: 400 }
      )
    }

    // Validate items
    for (const item of orderData.items) {
      if (!item.product_id) {
        return new Response(
          JSON.stringify({ error: 'All items must have a product_id' }),
          { status: 400 }
        )
      }
      if (!item.quantity || item.quantity <= 0) {
        return new Response(
          JSON.stringify({ error: 'All items must have a positive quantity' }),
          { status: 400 }
        )
      }
    }

    // Verify patient exists and get pricing
    const { data: patient, error: patientError } = await supabaseClient
      .from('patients')
      .select('owner_id')
      .eq('id', orderData.patient_id)
      .single()

    if (patientError || !patient) {
      return new Response(
        JSON.stringify({ error: 'Invalid patient ID' }),
        { status: 400 }
      )
    }

    // Create order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        patient_id: orderData.patient_id,
        status: 'pending',
        total_amount: 0, // Will be calculated
        shipping_address: orderData.shipping_address,
        notes: orderData.notes
      })
      .select()
      .single()

    if (orderError) throw new Error(orderError.message)

    return new Response(
      JSON.stringify({ data: order }),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})
