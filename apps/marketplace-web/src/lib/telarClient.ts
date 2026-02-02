import { createClient } from '@supabase/supabase-js';

// =============================================================================
// CLIENTE EXCLUSIVO PARA TELAR.IA (app.telar.co)
// =============================================================================
// Este cliente conecta ÚNICAMENTE a la base de datos de telar.ia donde están
// los productos y tiendas artesanales. NUNCA debe apuntar al proyecto local.
//
// Proyecto telar.ia: https://ylooqmqmoufqtxvetxuj.supabase.co
// Proyecto local (Lovable Cloud): https://qzjcgwchexqpykqsxxcr.supabase.co
//
// IMPORTANTE: Las credenciales están hardcodeadas intencionalmente para
// garantizar que SIEMPRE conecte a telar.ia, sin importar variables de entorno.
// La anon key es pública y de solo lectura, por lo que es seguro hardcodearla.
// =============================================================================

const TELAR_URL = 'https://ylooqmqmoufqtxvetxuj.supabase.co';
const TELAR_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlsb29xbXFtb3VmcXR4dmV0eHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2Nzc1ODIsImV4cCI6MjA2MzI1MzU4Mn0.F_FtGBwpHKBpog6Ad4zUjmogRZMLNVgk18rsbMv7JYs';

// Exportar cliente de solo lectura para queries de productos y tiendas artesanales
export const telarClient = createClient(TELAR_URL, TELAR_ANON_KEY);
