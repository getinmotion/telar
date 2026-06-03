-- ============================================================
-- Seed data for local development testing
-- Artesano de prueba: Carlos Mendoza (cerámica)
-- UUID fijo para facilitar pruebas repetibles
-- ============================================================

-- UUIDs fijos para los datos de prueba
-- Artesano:  a1b2c3d4-0001-0001-0001-000000000001
-- Session 1: s1000000-0001-0001-0001-000000000001  (sesión reciente)
-- Session 2: s2000000-0002-0002-0002-000000000002  (sesión antigua)

-- ============================================================
-- 1. Perfil global del artesano
-- ============================================================
INSERT INTO agents.artisan_global_profiles (
    artisan_id,
    profile_summary,
    key_insights,
    interaction_count,
    last_interaction_at,
    maturity_snapshot
) VALUES (
    'a1b2c3d4-0001-0001-0001-000000000001',
    'Carlos Mendoza es un artesano ceramista de Bogotá con 8 años de experiencia. Especializado en cerámica utilitaria y decorativa con técnicas prehispánicas. Vende principalmente en ferias artesanales y está empezando a explorar ventas online. Tiene precios bajos comparados con el mercado y necesita apoyo en marketing digital.',
    '{
        "nombre": "Carlos Mendoza",
        "tipo_artesania": "cerámica",
        "ubicacion": "Bogotá, Colombia",
        "experiencia": "8 años",
        "whatsapp_number": "3001234567",
        "canal_principal": "ferias artesanales",
        "desafio_principal": "precios y ventas online"
    }',
    12,
    NOW() - INTERVAL '2 hours',
    '{
        "general": "intermedio",
        "identidad_artesanal": "avanzado",
        "realidad_comercial": "basico",
        "clientes_y_mercado": "intermedio",
        "operacion_y_crecimiento": "basico"
    }'
) ON CONFLICT (artisan_id) DO UPDATE SET
    profile_summary     = EXCLUDED.profile_summary,
    key_insights        = EXCLUDED.key_insights,
    interaction_count   = EXCLUDED.interaction_count,
    last_interaction_at = EXCLUDED.last_interaction_at,
    maturity_snapshot   = EXCLUDED.maturity_snapshot,
    updated_at          = NOW();

-- ============================================================
-- 2. Perfil de onboarding
-- ============================================================
INSERT INTO agents.user_onboarding_profiles (
    user_id,
    session_id,
    nombre,
    ubicacion,
    tipo_artesania,
    madurez_identidad_artesanal,
    madurez_identidad_artesanal_razon,
    madurez_identidad_artesanal_tareas,
    madurez_realidad_comercial,
    madurez_realidad_comercial_razon,
    madurez_realidad_comercial_tareas,
    madurez_clientes_y_mercado,
    madurez_clientes_y_mercado_razon,
    madurez_clientes_y_mercado_tareas,
    madurez_operacion_y_crecimiento,
    madurez_operacion_y_crecimiento_razon,
    madurez_operacion_y_crecimiento_tareas,
    madurez_general,
    resumen,
    raw_responses
) VALUES (
    'a1b2c3d4-0001-0001-0001-000000000001',
    's1000000-0001-0001-0001-000000000001',
    'Carlos Mendoza',
    'Bogotá, Colombia',
    'cerámica',
    'avanzado',
    'Tiene identidad clara como ceramista, conoce sus técnicas y diferenciadores',
    '["Documentar técnicas prehispánicas propias", "Crear historia de marca"]',
    'basico',
    'No tiene estructura de costos clara ni precios competitivos',
    '["Calcular costo real por pieza", "Investigar precios de mercado", "Definir margen mínimo"]',
    'intermedio',
    'Conoce sus clientes de ferias pero no tiene estrategia digital',
    '["Crear perfil en Instagram", "Fotografiar productos profesionalmente"]',
    'basico',
    'Opera de forma informal sin procesos definidos',
    '["Llevar registro de ventas", "Definir política de devoluciones"]',
    'intermedio',
    'Carlos tiene fuerte identidad artesanal pero necesita fortalecer la parte comercial y operativa. Sus principales oportunidades están en mejorar precios y construir presencia digital.',
    '{
        "pregunta_artesania": "cerámica utilitaria y decorativa con técnicas prehispánicas",
        "pregunta_experiencia": "8 años haciendo cerámica",
        "pregunta_ventas": "ferias artesanales en Bogotá, algunos encargos por WhatsApp",
        "pregunta_desafio": "no sé cómo poner precios justos y llegar a más clientes"
    }'
) ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. Conversaciones recientes (sesión activa)
-- ============================================================
INSERT INTO agents.agent_conversations (
    id, session_id, user_id, agent_type,
    user_input, agent_output, selected_agent,
    routing_confidence, execution_time_ms, created_at
) VALUES
(
    uuid_generate_v4(),
    's1000000-0001-0001-0001-000000000001',
    'a1b2c3d4-0001-0001-0001-000000000001',
    'pricing',
    '¿Cómo calculo el precio de mis jarrones de cerámica?',
    '{
        "answer": "Para calcular el precio de tus jarrones te recomiendo el método costo-plus: suma materiales + tiempo (horas × tarifa/hora) + gastos fijos prorrateados, luego multiplica × 2.5 para margen. Para cerámica artesanal en Colombia el rango típico es $45.000–$120.000 según tamaño y complejidad.",
        "confidence": "high",
        "used_rag": false,
        "used_web_search": true
    }',
    'pricing',
    0.95,
    3200,
    NOW() - INTERVAL '1 hour'
),
(
    uuid_generate_v4(),
    's1000000-0001-0001-0001-000000000001',
    'a1b2c3d4-0001-0001-0001-000000000001',
    'presencia_digital',
    '¿Qué fotos debo publicar en Instagram para vender más?',
    '{
        "answer": "Para cerámica en Instagram funciona mejor: fotos de proceso (manos trabajando la arcilla), antes/después, productos en contexto de uso (jarrón con flores en mesa), y reels cortos del torno. Publica 4–5 veces por semana con hashtags como #ceramicacolombiana #artesaniacolombiana.",
        "confidence": "medium",
        "used_rag": false
    }',
    'presencia_digital',
    0.88,
    2800,
    NOW() - INTERVAL '30 minutes'
),
(
    uuid_generate_v4(),
    's1000000-0001-0001-0001-000000000001',
    'a1b2c3d4-0001-0001-0001-000000000001',
    'servicio_cliente',
    'crear política de devoluciones',
    '{
        "wizard_complete": true,
        "policy_document": "# Política de Devoluciones de Carlos Mendoza Cerámica\n\n## 1. Plazo\nLos clientes tienen 15 días calendario para solicitar devolución.\n\n## 2. Condición\nEl producto debe estar sin uso y en su empaque original.\n\n## 3. Costos de envío\nLa tienda asume el costo si es defecto de fabricación; el cliente si es arrepentimiento.\n\n## 4. Soluciones\nReembolso total o cambio por otro producto de igual valor.\n\n## 5. Procesamiento\n5 días hábiles para resolver la devolución.",
        "answer": "¡Excelente! Tu política de devoluciones está lista.",
        "wizard_active": true
    }',
    'servicio_cliente',
    0.92,
    1500,
    NOW() - INTERVAL '10 minutes'
);

-- ============================================================
-- 4. Memorias vectoriales (sin embedding real — para probar
--    el flujo de recuperación por session_id y artisan_id)
--    Los embeddings reales se generan al interactuar con el agente.
-- ============================================================
INSERT INTO agents.agent_knowledge_embeddings (
    chunk_text, knowledge_category, memory_type,
    agent_type, artisan_id, session_id,
    summary, importance_score, created_at
) VALUES
(
    'Carlos preguntó cómo calcular precio de jarrones. Se le explicó método costo-plus: materiales + tiempo × tarifa + gastos fijos × 2.5. Rango en Colombia: $45.000–$120.000.',
    'pricing',
    'conversational',
    'pricing',
    'a1b2c3d4-0001-0001-0001-000000000001',
    's1000000-0001-0001-0001-000000000001',
    'Consulta sobre pricing de jarrones de cerámica',
    0.8,
    NOW() - INTERVAL '1 hour'
),
(
    'Carlos preguntó qué fotos publicar en Instagram. Se recomendaron fotos de proceso, antes/después y productos en contexto. Frecuencia: 4–5 veces por semana.',
    'presencia_digital',
    'conversational',
    'presencia_digital',
    'a1b2c3d4-0001-0001-0001-000000000001',
    's1000000-0001-0001-0001-000000000001',
    'Consulta sobre contenido Instagram para cerámica',
    0.7,
    NOW() - INTERVAL '30 minutes'
),
(
    'Política de devoluciones generada para Carlos Mendoza Cerámica: 15 días, sin uso, envío según causa, reembolso o cambio, 5 días hábiles.',
    'servicio_cliente',
    'strategy',
    'servicio_cliente',
    'a1b2c3d4-0001-0001-0001-000000000001',
    's1000000-0001-0001-0001-000000000001',
    'Política de devoluciones creada y aprobada',
    0.85,
    NOW() - INTERVAL '10 minutes'
),
(
    'Perfil onboarding: Carlos Mendoza, ceramista de Bogotá, 8 años experiencia. Tipo de artesanía: cerámica utilitaria prehispánica. Experiencia: 8 años. Nivel de Madurez General: intermedio. Vende en ferias, desafío principal: precios y presencia digital.',
    'general',
    'profile',
    'onboarding',
    'a1b2c3d4-0001-0001-0001-000000000001',
    's1000000-0001-0001-0001-000000000001',
    'Onboarding completo de Carlos Mendoza',
    0.9,
    NOW() - INTERVAL '2 hours'
);

-- ============================================================
-- Verificación
-- ============================================================
SELECT 'artisan_global_profiles' AS tabla, COUNT(*) AS filas FROM agents.artisan_global_profiles
UNION ALL
SELECT 'user_onboarding_profiles', COUNT(*) FROM agents.user_onboarding_profiles
UNION ALL
SELECT 'agent_conversations', COUNT(*) FROM agents.agent_conversations
UNION ALL
SELECT 'agent_knowledge_embeddings', COUNT(*) FROM agents.agent_knowledge_embeddings
UNION ALL
SELECT 'agent_knowledge_documents', COUNT(*) FROM agents.agent_knowledge_documents;
