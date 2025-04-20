import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface PatientData {
  first_name: string;
  last_name: string;
  email: string;
  [key: string]: any;
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

    // Required fields validation
    const requiredFields = ['first_name', 'last_name', 'email']
    for (const field of requiredFields) {
      if (!data[field]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400 }
        )
      }
    }

    // Insert patient
    const { data: patient, error } = await supabaseClient
      .from('patients')
      .insert(data)
      .select()
      .single()

    if (error) throw new Error(error.message)

    return new Response(
      JSON.stringify({ data: patient }),
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
