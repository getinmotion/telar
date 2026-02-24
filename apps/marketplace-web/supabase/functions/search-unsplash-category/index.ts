import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Términos de búsqueda precisos para cada categoría de artesanías colombianas
const CATEGORY_SEARCH_TERMS: Record<string, string> = {
  'Joyería y Accesorios': 'colombian handmade jewelry artisan',
  'Textiles': 'colombian textile weaving artisan handmade',
  'Textiles y Prendas': 'colombian textile weaving artisan fabric',
  'Cerámica': 'colombian pottery ceramic handmade artisan',
  'Cerámica y Alfarería': 'colombian pottery ceramic handmade',
  'Madera': 'wooden crafts handmade artisan',
  'Cestería': 'basket weaving wicker handicraft artisan',
  'Cestería y Fibras': 'basket weaving natural fiber artisan',
  'Decoración': 'handmade home decor artisan crafts',
  'Decoración del Hogar': 'handmade home decor artisan',
  'Arte': 'colombian folk art handicraft artisan',
  'Arte y Esculturas': 'colombian sculpture art handmade',
  'Bolsos y Carteras': 'handmade bags leather artisan colombian',
  'Vajillas y Cocina': 'handmade tableware ceramic pottery',
  'Muebles': 'handmade furniture wood artisan',
  'Iluminación': 'handmade lamps lighting artisan',
  'Juguetes y Didácticos': 'handmade wooden toys artisan craft',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { category } = await req.json()
    
    if (!category) {
      return new Response(
        JSON.stringify({ error: 'Category is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const UNSPLASH_ACCESS_KEY = Deno.env.get('UNSPLASH_ACCESS_KEY')
    if (!UNSPLASH_ACCESS_KEY) {
      console.error('UNSPLASH_ACCESS_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Unsplash API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Obtener el término de búsqueda específico para esta categoría
    const searchTerm = CATEGORY_SEARCH_TERMS[category] || 'handmade artisan crafts'
    
    console.log(`[Unsplash] Buscando imágenes para categoría: ${category}`)
    console.log(`[Unsplash] Término de búsqueda: ${searchTerm}`)

    // Buscar en Unsplash
    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=5&orientation=landscape`
    
    const response = await fetch(unsplashUrl, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        'Accept-Version': 'v1',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Unsplash] Error ${response.status}:`, errorText)
      return new Response(
        JSON.stringify({ 
          error: `Unsplash API error: ${response.status}`,
          details: errorText 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const data = await response.json()
    
    if (!data.results || data.results.length === 0) {
      console.log(`[Unsplash] No se encontraron imágenes para: ${searchTerm}`)
      return new Response(
        JSON.stringify({ error: 'No images found for this category' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Elegir una imagen aleatoria de los primeros 5 resultados
    const randomIndex = Math.floor(Math.random() * Math.min(5, data.results.length))
    const selectedImage = data.results[randomIndex]
    
    const imageUrl = selectedImage.urls.regular
    
    console.log(`[Unsplash] ✅ Imagen seleccionada para ${category}:`, imageUrl)

    return new Response(
      JSON.stringify({ 
        imageUrl,
        photographer: selectedImage.user.name,
        photographerUrl: selectedImage.user.links.html,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('[Unsplash] Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
