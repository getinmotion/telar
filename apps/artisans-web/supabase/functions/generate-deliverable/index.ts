/**
 * Generate Deliverable - Edge Function
 * 
 * Genera entregables con IA según el tipo de misión completada.
 * Tipos: brand report, pricing guide, growth strategy, inventory analysis
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateDeliverableRequest {
  taskId: string;
  agentId: string;
  deliverableType: 'brand_report' | 'pricing_guide' | 'growth_strategy' | 'inventory_analysis' | 'market_research';
  contextData?: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { taskId, agentId, deliverableType, contextData }: GenerateDeliverableRequest = await req.json();

    console.log('[GenerateDeliverable] Processing:', {
      userId: user.id,
      taskId,
      agentId,
      deliverableType
    });

    // Obtener datos del usuario y tarea
    const { data: profileData } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const { data: taskData } = await supabaseClient
      .from('agent_tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    const { data: maturityScores } = await supabaseClient
      .from('user_maturity_scores')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Generar contenido del entregable
    const deliverable = await generateDeliverableContent(
      deliverableType,
      agentId,
      {
        profile: profileData,
        task: taskData,
        maturityScores,
        contextData
      }
    );

    // Guardar entregable en la base de datos
    const { data: savedDeliverable, error: saveError } = await supabaseClient
      .from('agent_deliverables')
      .insert({
        user_id: user.id,
        task_id: taskId,
        agent_id: agentId,
        title: deliverable.title,
        description: deliverable.description,
        file_type: deliverable.fileType,
        content: deliverable.content,
        metadata: {
          deliverable_type: deliverableType,
          generated_at: new Date().toISOString(),
          version: '1.0'
        }
      })
      .select()
      .single();

    if (saveError) {
      console.error('[GenerateDeliverable] Error saving:', saveError);
      throw new Error('Error al guardar entregable');
    }

    console.log('[GenerateDeliverable] Deliverable created:', savedDeliverable.id);

    return new Response(
      JSON.stringify({
        success: true,
        data: savedDeliverable
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("[GenerateDeliverable] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function generateDeliverableContent(
  type: string,
  agentId: string,
  context: any
): Promise<any> {
  const { profile, maturityScores, task } = context;

  switch (type) {
    case 'brand_report':
      return {
        title: `Reporte de Marca - ${profile?.brand_name || 'Tu Negocio'}`,
        description: 'Análisis completo de tu identidad de marca y recomendaciones estratégicas',
        fileType: 'report',
        content: {
          sections: [
            {
              title: 'Resumen Ejecutivo',
              content: `Tu marca "${profile?.brand_name || 'Tu Negocio'}" tiene una base sólida. Este reporte analiza tu posicionamiento actual y proporciona recomendaciones accionables.`
            },
            {
              title: 'Análisis de Identidad Visual',
              content: maturityScores 
                ? `Puntaje de validación de idea: ${maturityScores.idea_validation}/100. Áreas de oportunidad identificadas para fortalecer tu marca.`
                : 'Completa tu evaluación de madurez para obtener insights detallados.'
            },
            {
              title: 'Recomendaciones Estratégicas',
              items: [
                'Desarrollar una guía de estilo visual consistente',
                'Definir tono de voz para comunicaciones',
                'Crear contenido que refleje tus valores artesanales',
                'Fortalecer presencia en redes sociales clave'
              ]
            },
            {
              title: 'Próximos Pasos',
              items: [
                'Diseñar logo profesional si aún no tienes',
                'Establecer paleta de colores principal',
                'Crear plantillas para redes sociales',
                'Documentar historia de tu marca'
              ]
            }
          ],
          generatedAt: new Date().toISOString()
        }
      };

    case 'pricing_guide':
      return {
        title: 'Guía de Estrategia de Precios',
        description: 'Análisis de costos y recomendaciones de precios para tus productos artesanales',
        fileType: 'guide',
        content: {
          sections: [
            {
              title: 'Metodología de Cálculo',
              content: 'Para productos artesanales, considera: Costo de materiales + Tiempo de trabajo + Gastos generales + Margen de ganancia (40-60%)'
            },
            {
              title: 'Análisis Competitivo',
              content: 'Investigación de precios de mercado en tu categoría y región.'
            },
            {
              title: 'Estrategias Recomendadas',
              items: [
                'Precio premium por calidad artesanal',
                'Descuentos por volumen para clientes mayoristas',
                'Precios dinámicos según temporada',
                'Bundles de productos complementarios'
              ]
            },
            {
              title: 'Consideraciones Psicológicas',
              content: 'Los precios que terminan en .99 o .95 funcionan bien. Evita subestimar tu trabajo artesanal.'
            }
          ],
          generatedAt: new Date().toISOString()
        }
      };

    case 'growth_strategy':
      return {
        title: 'Plan de Crecimiento Personalizado',
        description: 'Estrategia de crecimiento basada en tu nivel de madurez actual',
        fileType: 'report',
        content: {
          sections: [
            {
              title: 'Estado Actual',
              content: maturityScores
                ? `Tu negocio muestra: Validación ${maturityScores.idea_validation}/100, Experiencia ${maturityScores.user_experience}/100, Market Fit ${maturityScores.market_fit}/100, Monetización ${maturityScores.monetization}/100`
                : 'Realiza tu evaluación para obtener insights personalizados'
            },
            {
              title: 'Objetivos a 90 Días',
              items: [
                'Aumentar visibilidad en redes sociales',
                'Crear catálogo digital profesional',
                'Establecer canales de venta online',
                'Construir base de clientes recurrentes'
              ]
            },
            {
              title: 'Tácticas de Crecimiento',
              items: [
                'Marketing de contenido en Instagram/Facebook',
                'Colaboraciones con otros artesanos',
                'Participación en ferias artesanales',
                'Email marketing para clientes existentes'
              ]
            },
            {
              title: 'Métricas Clave',
              content: 'Tracking: Alcance en redes, conversión de visitas a ventas, valor promedio del pedido, tasa de clientes recurrentes'
            }
          ],
          generatedAt: new Date().toISOString()
        }
      };

    case 'inventory_analysis':
      return {
        title: 'Análisis de Inventario',
        description: 'Recomendaciones para optimizar tu gestión de inventario artesanal',
        fileType: 'report',
        content: {
          sections: [
            {
              title: 'Estado del Inventario',
              content: 'Análisis de productos disponibles y rotación'
            },
            {
              title: 'Productos de Alta Demanda',
              content: 'Identificación de bestsellers que requieren más stock'
            },
            {
              title: 'Optimización de Costos',
              items: [
                'Compra de materiales en volumen',
                'Reducción de desperdicio',
                'Just-in-time para productos bajo pedido',
                'Control de calidad de materias primas'
              ]
            },
            {
              title: 'Recomendaciones',
              items: [
                'Implementar sistema de tracking simple',
                'Establecer puntos de reorden',
                'Diversificar proveedores clave',
                'Crear buffer de seguridad para bestsellers'
              ]
            }
          ],
          generatedAt: new Date().toISOString()
        }
      };

    case 'market_research':
      return {
        title: 'Investigación de Mercado',
        description: 'Análisis de tu mercado objetivo y oportunidades',
        fileType: 'report',
        content: {
          sections: [
            {
              title: 'Mercado Objetivo',
              content: `Basado en tu tipo de negocio: ${profile?.business_type || 'artesanía'}, tu mercado incluye consumidores que valoran productos únicos y hechos a mano.`
            },
            {
              title: 'Tendencias del Sector',
              items: [
                'Creciente demanda de productos sostenibles',
                'Valoración de historias detrás del producto',
                'Preferencia por compras locales',
                'Aumento de ventas online post-pandemia'
              ]
            },
            {
              title: 'Competencia',
              content: 'Análisis de competidores directos e indirectos en tu región'
            },
            {
              title: 'Oportunidades Identificadas',
              items: [
                'Nicho de productos personalizados',
                'Mercado corporativo (regalos empresariales)',
                'Export potencial a mercados internacionales',
                'Colaboraciones con diseñadores'
              ]
            }
          ],
          generatedAt: new Date().toISOString()
        }
      };

    default:
      return {
        title: 'Entregable Generado',
        description: 'Documento generado automáticamente',
        fileType: 'text',
        content: {
          message: 'Este es un entregable de ejemplo. Configura el tipo específico para contenido personalizado.'
        }
      };
  }
}
