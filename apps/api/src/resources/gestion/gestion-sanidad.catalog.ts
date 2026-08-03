import {
  APPROVED_STATUS_SQL,
  FICHA_COMPLETA,
  TIENE_NARRATIVA,
  TIENE_PASAPORTE,
  TIENE_PRECIO,
} from './gestion-definiciones';

/**
 * Registro de líneas del panel de sanidad de datos (Bloque 4 del brief).
 *
 * El código que llega por query string se usa SOLO como clave de este
 * diccionario; nunca se concatena en el SQL. Lo que se interpola son estos
 * predicados, que son constantes escritas aquí.
 *
 * Alias disponibles en los predicados:
 *   level 'up'       → `u` = fila de up_sel
 *   level 'producto' → `p` = shop.products_core, y también `u`
 */

export type SanidadLevel = 'up' | 'producto';
export type SanidadSeverity = 'alta' | 'media' | 'baja';

/**
 * Denominador propio de cada línea. Es lo que evita comparar tramposamente una
 * línea con base ~172 (unidades) contra otra con base ~600 (productos).
 */
export type SanidadDenominator = 'up' | 'productos' | 'productos_aprobados';

export interface SanidadIssue {
  code: string;
  label: string;
  level: SanidadLevel;
  severity: SanidadSeverity;
  hint: string;
  predicate: string;
  denominator: SanidadDenominator;
  /** Booleanos extra que se devuelven en `missing[]`. Nunca valores. */
  subReasons?: { code: string; label: string; expr: string }[];
  reliability?: string;
}

export const SANIDAD_ISSUES: SanidadIssue[] = [
  // ── Nivel unidad productiva ────────────────────────────────────────────────
  {
    code: 'banco_sin_verificar',
    label: 'Datos bancarios sin verificar',
    level: 'up',
    severity: 'alta',
    hint: 'Sin contraparte verificada en la pasarela de pagos: no puede recibir dinero.',
    predicate: `NOT u.has_counterparty`,
    denominator: 'up',
    subReasons: [
      {
        code: 'bank_data_autodeclarado_incompleto',
        label: 'Formulario bancario sin completar',
        expr: `u.bank_data_status IS DISTINCT FROM 'complete'`,
      },
    ],
    reliability:
      'Se mide por la existencia de contraparte en la pasarela, no por el campo autodeclarado, que casi no se escribe. Solo presencia y estado: ningún dato financiero sale de la base.',
  },
  {
    code: 'documento_o_rut_faltante',
    label: 'Documento de identidad o RUT faltante',
    level: 'up',
    severity: 'alta',
    hint: 'Sin identificación no se puede formalizar el pago ni acreditar al beneficiario.',
    predicate: `(NOT u.has_id_number OR (NOT u.has_rut AND NOT u.rut_pendiente))`,
    denominator: 'up',
    subReasons: [
      {
        code: 'sin_documento',
        label: 'Sin documento de identidad',
        expr: `NOT u.has_id_number`,
      },
      // Excluye el caso pendiente: "Sin RUT" y "RUT pendiente" juntos se leen
      // como una contradicción en el reporte.
      {
        code: 'sin_rut',
        label: 'Sin RUT',
        expr: `(NOT u.has_rut AND NOT u.rut_pendiente)`,
      },
      {
        code: 'rut_pendiente',
        label: 'RUT declarado como pendiente',
        expr: `u.rut_pendiente`,
      },
    ],
    reliability:
      'Se reporta presencia, nunca el número. "RUT pendiente" es una declaración explícita del artesano y no cuenta como dato faltante.',
  },
  {
    code: 'contacto_incompleto',
    label: 'Datos de contacto incompletos',
    level: 'up',
    severity: 'media',
    hint: 'Falta celular o correo: no hay por dónde acompañar a la unidad productiva.',
    predicate: `(NOT u.has_whatsapp OR NOT u.has_email)`,
    denominator: 'up',
    subReasons: [
      { code: 'sin_celular', label: 'Sin celular', expr: `NOT u.has_whatsapp` },
      { code: 'sin_correo', label: 'Sin correo', expr: `NOT u.has_email` },
    ],
  },
  {
    code: 'direccion_sin_definir',
    label: 'Dirección de despacho o de origen sin definir',
    level: 'up',
    severity: 'media',
    hint: 'Sin dirección no se puede cotizar el envío ni ubicar la unidad en el mapa.',
    predicate: `(NOT u.has_address AND NOT u.has_origin)`,
    denominator: 'up',
    subReasons: [
      {
        code: 'sin_despacho',
        label: 'Sin dirección de despacho',
        expr: `NOT u.has_address`,
      },
      {
        code: 'sin_origen',
        label: 'Sin departamento y municipio de origen',
        expr: `NOT u.has_origin`,
      },
    ],
  },
  {
    code: 'pasaporte_sin_generar',
    label: 'Pasaporte de Origen sin generar',
    level: 'up',
    severity: 'media',
    hint: 'Tiene catálogo aprobado pero ninguna pieza con certificado de origen.',
    // Restringido a UP con catálogo aprobado: sin esta cláusula el panel
    // acusaría a tiendas que ni siquiera tienen producto, que ya salen en
    // "en riesgo".
    predicate: `(u.passports_issued = 0 AND u.approved_products > 0)`,
    denominator: 'up',
  },

  // ── Nivel producto ─────────────────────────────────────────────────────────
  {
    code: 'sin_imagenes',
    label: 'Producto sin fotografías',
    level: 'producto',
    severity: 'alta',
    hint: 'Sin imagen la pieza no se puede publicar ni vender.',
    predicate: `NOT EXISTS (SELECT 1 FROM shop.product_media pm WHERE pm.product_id = p.id AND pm.deleted_at IS NULL)`,
    denominator: 'productos',
  },
  {
    code: 'ficha_incompleta',
    label: 'Ficha técnica incompleta',
    level: 'producto',
    severity: 'alta',
    hint: 'Faltan medidas, materiales, técnica, categoría, imagen o descripción.',
    predicate: `NOT ${FICHA_COMPLETA}`,
    denominator: 'productos',
    reliability:
      'Ficha completa = descripción + categoría + al menos una imagen + medidas y peso mayores que cero + oficio y técnica + al menos un material.',
  },
  {
    code: 'sin_precio',
    label: 'Producto sin precio definido',
    level: 'producto',
    severity: 'alta',
    hint: 'Ninguna variante viva tiene precio mayor que cero.',
    predicate: `NOT ${TIENE_PRECIO}`,
    denominator: 'productos',
  },
  {
    code: 'sin_narrativa',
    label: 'Producto sin narrativa',
    level: 'producto',
    severity: 'media',
    hint: 'Sin historia ni descripción del proceso: la pieza pierde su valor cultural.',
    predicate: `NOT ${TIENE_NARRATIVA}`,
    denominator: 'productos',
  },
  {
    code: 'sin_pasaporte',
    label: 'Producto aprobado sin Pasaporte de Origen',
    level: 'producto',
    severity: 'media',
    hint: 'Pieza lista para vender pero sin certificado de origen emitido.',
    // Solo sobre aprobados: es el único conjunto del que se espera pasaporte.
    predicate: `(p.status IN ${APPROVED_STATUS_SQL} AND NOT ${TIENE_PASAPORTE})`,
    denominator: 'productos_aprobados',
  },
  {
    code: 'sin_categoria',
    label: 'Producto sin categoría',
    level: 'producto',
    severity: 'media',
    hint: 'No aparece en la navegación del marketplace.',
    predicate: `p.category_id IS NULL`,
    denominator: 'productos',
  },
  {
    code: 'sin_descripcion',
    label: 'Producto sin descripción',
    level: 'producto',
    severity: 'media',
    hint: 'Sin descripción corta la ficha queda vacía.',
    predicate: `COALESCE(TRIM(p.short_description), '') = ''`,
    denominator: 'productos',
  },
  {
    code: 'sin_identidad',
    label: 'Producto sin identidad artesanal',
    level: 'producto',
    severity: 'media',
    hint: 'Sin oficio ni técnica asociados.',
    predicate: `NOT EXISTS (SELECT 1 FROM shop.product_artisanal_identity pai WHERE pai.product_id = p.id AND pai.deleted_at IS NULL)`,
    denominator: 'productos',
  },
  {
    code: 'sin_materiales',
    label: 'Producto sin materiales',
    level: 'producto',
    severity: 'media',
    hint: 'No se puede acreditar de qué está hecha la pieza.',
    predicate: `NOT EXISTS (SELECT 1 FROM shop.product_materials_link pml WHERE pml.product_id = p.id AND pml.deleted_at IS NULL)`,
    denominator: 'productos',
  },
  {
    code: 'precio_sospechoso',
    label: 'Precio sospechosamente bajo',
    level: 'producto',
    severity: 'media',
    hint: 'Alguna variante cuesta un peso o menos: casi siempre es un error de carga.',
    predicate: `EXISTS (SELECT 1 FROM shop.product_variants pv WHERE pv.product_id = p.id AND pv.deleted_at IS NULL AND pv.base_price_minor > 0 AND pv.base_price_minor <= 100)`,
    denominator: 'productos',
  },
  {
    code: 'anomalia_volumen',
    label: 'Anomalía de peso o volumen',
    level: 'producto',
    severity: 'baja',
    hint: 'El peso declarado no cuadra con las medidas: rompe la cotización de envío.',
    predicate: `EXISTS (
      SELECT 1 FROM shop.product_physical_specs pps
      WHERE pps.product_id = p.id AND pps.deleted_at IS NULL
        AND (
          pps.real_weight_kg > 50
          OR pps.real_weight_kg > GREATEST((pps.length_or_diameter_cm * pps.width_cm * pps.height_cm) / 400.0, 0.01) * 10
        )
    )`,
    denominator: 'productos',
  },
];

export const SANIDAD_BY_CODE: Record<string, SanidadIssue> = Object.fromEntries(
  SANIDAD_ISSUES.map((i) => [i.code, i]),
);

export const SANIDAD_CODES: string[] = SANIDAD_ISSUES.map((i) => i.code);

export const DENOMINATOR_LABEL: Record<SanidadDenominator, string> = {
  up: 'unidades productivas',
  productos: 'productos',
  productos_aprobados: 'productos aprobados',
};
