import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const FASTAPI_BACKEND_URL = Deno.env.get('FASTAPI_BACKEND_URL') || 'http://localhost:8000'
const FASTAPI_API_KEY = Deno.env.get('FASTAPI_API_KEY') || ''

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: any
  old_record: any
}

serve(async (req) => {
  try {
    // Parse the webhook payload
    const payload: WebhookPayload = await req.json()
    
    console.log(`Received webhook for ${payload.table}: ${payload.type}`)
    
    // Only process INSERT and UPDATE events
    if (payload.type === 'DELETE') {
      return new Response(
        JSON.stringify({ message: 'Delete events are handled automatically by CASCADE' }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      )
    }
    
    const record = payload.record
    
    // Handle artisan_shops table
    if (payload.table === 'artisan_shops') {
      await handleShopUpdate(record)
    }
    
    // Handle products table
    if (payload.table === 'products') {
      await handleProductUpdate(record)
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'Embedding update triggered' }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function handleShopUpdate(shop: any) {
  // Prepare payload for FastAPI embedding endpoint
  const embedPayload = {
    shop_id: shop.id,
    product_id: null,
    shop_name: shop.shop_name,
    description: shop.description,
    story: shop.story,
    craft_type: shop.craft_type,
    region: shop.region,
    product_name: null,
    product_description: null,
    price: null,
    category: null
  }
  
  // Call FastAPI embedding endpoint
  const response = await fetch(`${FASTAPI_BACKEND_URL}/embed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': FASTAPI_API_KEY
    },
    body: JSON.stringify(embedPayload)
  })
  
  if (!response.ok) {
    const error = await response.text()
    console.error('Failed to create shop embedding:', error)
    throw new Error(`Failed to create shop embedding: ${error}`)
  }
  
  const result = await response.json()
  console.log('Shop embedding created:', result)
  
  return result
}

async function handleProductUpdate(product: any) {
  // Get the shop information for the product
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  const { data: shop, error } = await supabase
    .from('artisan_shops')
    .select('*')
    .eq('id', product.shop_id)
    .single()
  
  if (error || !shop) {
    console.error('Failed to fetch shop for product:', error)
    throw new Error('Failed to fetch shop information')
  }
  
  // Prepare payload for FastAPI embedding endpoint
  const embedPayload = {
    shop_id: shop.id,
    product_id: product.id,
    shop_name: shop.shop_name,
    description: shop.description,
    story: shop.story,
    craft_type: shop.craft_type,
    region: shop.region,
    product_name: product.name,
    product_description: product.description,
    price: product.price,
    category: product.category
  }
  
  // Call FastAPI embedding endpoint
  const response = await fetch(`${FASTAPI_BACKEND_URL}/embed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': FASTAPI_API_KEY
    },
    body: JSON.stringify(embedPayload)
  })
  
  if (!response.ok) {
    const error = await response.text()
    console.error('Failed to create product embedding:', error)
    throw new Error(`Failed to create product embedding: ${error}`)
  }
  
  const result = await response.json()
  console.log('Product embedding created:', result)
  
  return result
}

