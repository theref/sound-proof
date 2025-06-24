
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const LIGHTHOUSE_API_KEY = Deno.env.get('LIGHTHOUSE_API_KEY')
    
    if (!LIGHTHOUSE_API_KEY) {
      throw new Error('LIGHTHOUSE_API_KEY is not configured')
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      throw new Error('No file provided')
    }

    console.log('Uploading file to Lighthouse:', file.name)
    
    const lighthouseFormData = new FormData()
    lighthouseFormData.append('file', file)

    const response = await fetch('https://node.lighthouse.storage/api/v0/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LIGHTHOUSE_API_KEY}`,
      },
      body: lighthouseFormData,
    })

    if (!response.ok) {
      throw new Error(`Lighthouse API error: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Lighthouse response:', data)

    // Handle different possible response structures
    let hash: string
    if (data && data.Hash) {
      hash = data.Hash
    } else if (data && data.data && data.data.Hash) {
      hash = data.data.Hash
    } else if (typeof data === 'string') {
      hash = data
    } else {
      console.error('Unexpected response structure:', data)
      throw new Error('Invalid response structure from Lighthouse')
    }

    console.log('Extracted hash:', hash)

    return new Response(
      JSON.stringify({ hash }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Lighthouse upload failed:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to upload file to Lighthouse' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
