/**
 * Definiciones canónicas del convenio con el Ministerio de las Culturas.
 *
 * Cada definición contiene el fragmento SQL que REALMENTE se ejecuta y el texto
 * que la UI muestra en el tooltip. Son el mismo objeto a propósito: si la query
 * y el tooltip fueran dos fuentes distintas, acabarían divergiendo y el número
 * dejaría de ser defendible frente al Ministerio.
 *
 * NADA de esto cambia el esquema: son predicados de lectura sobre tablas que ya
 * existen.
 */

// ─── Umbrales del convenio ───────────────────────────────────────────────────

/** "de 3 a 5 productos publicados y activos por artesano al cierre" → piso = 3. */
export const MIN_APPROVED_FOR_ACTIVE = 3;

/** "sin actividad registrada en 30 días". */
export const INACTIVITY_DAYS = 30;

// Estos dos números se interpolan en SQL. Nunca vienen de input de usuario,
// pero lo afirmamos en tiempo de carga para que no pueda cambiar por descuido.
if (
  !Number.isInteger(MIN_APPROVED_FOR_ACTIVE) ||
  !Number.isInteger(INACTIVITY_DAYS)
) {
  throw new Error('gestion-definiciones: los umbrales deben ser enteros.');
}

/** products_core.status autoritativo para "aprobado por moderación". */
export const APPROVED_STATUS_SQL = `('approved', 'approved_with_edits')`;

/**
 * Datos bancarios verificados. Medido contra la BD (2026-07-31, 172 UP):
 *   bank_data_status = 'complete' →   2 UP
 *   id_contraparty presente        → 135 UP
 *   ambas                          →   1 UP
 *
 * `bank_data_status` prácticamente no se escribe: exigir las dos señales daría
 * 171 de 172 UP "sin datos bancarios", que es ruido, no información. La señal
 * autoritativa es `id_contraparty`: existe porque Cobre (el PSP) aceptó los
 * datos y devolvió un identificador de contraparte, o sea que la verificación
 * ocurrió de verdad. `bank_data_status` queda como sub-razón informativa.
 */
export const BANCO_VERIFICADO = `u.has_counterparty`;

// ─── Predicados de producto (alias `p` = shop.products_core) ─────────────────

/**
 * Producto con precio definido: existe al menos una variante viva y activa con
 * precio > 0. `base_price_minor` está en centavos de COP.
 */
export const TIENE_PRECIO = `EXISTS (
  SELECT 1 FROM shop.product_variants v
  WHERE v.product_id = p.id
    AND v.deleted_at IS NULL
    AND v.is_active
    AND v.base_price_minor IS NOT NULL
    AND v.base_price_minor > 0
)`;

/**
 * Ficha técnica completa. Seis condiciones, todas obligatorias: es la
 * intersección de lo que el pipeline necesita para vender (imagen, categoría,
 * dimensiones y peso reales — que es lo que consume la cotización de envío) con
 * lo que el convenio necesita para acreditar (oficio, técnica, materiales).
 *
 * Deja fuera A PROPÓSITO la narrativa (`history`) y la descripción de proceso:
 * son valor editorial, no bloqueantes de venta. Meterlas aquí confundiría "no se
 * puede vender" con "no cuenta su historia". La narrativa tiene su propia línea
 * en el panel de sanidad.
 *
 * Las dimensiones y el peso se exigen `> 0`, no `IS NOT NULL`: cuando el wizard
 * se salta el paso llegan como 0, no como NULL.
 */
export const FICHA_COMPLETA = `(
      COALESCE(TRIM(p.short_description), '') <> ''
  AND p.category_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM shop.product_media m
              WHERE m.product_id = p.id AND m.deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM shop.product_physical_specs ps
              WHERE ps.product_id = p.id AND ps.deleted_at IS NULL
                AND ps.height_cm > 0 AND ps.width_cm > 0
                AND ps.length_or_diameter_cm > 0 AND ps.real_weight_kg > 0)
  AND EXISTS (SELECT 1 FROM shop.product_artisanal_identity ai
              WHERE ai.product_id = p.id AND ai.deleted_at IS NULL
                AND ai.primary_craft_id IS NOT NULL
                AND ai.primary_technique_id IS NOT NULL)
  AND EXISTS (SELECT 1 FROM shop.product_materials_link ml
              WHERE ml.product_id = p.id AND ml.deleted_at IS NULL)
)`;

/** Narrativa: historia del producto o descripción del proceso productivo. */
export const TIENE_NARRATIVA = `(
     COALESCE(TRIM(p.history), '') <> ''
  OR EXISTS (SELECT 1 FROM shop.product_production pp
             WHERE pp.product_id = p.id AND pp.deleted_at IS NULL
               AND COALESCE(TRIM(pp.process_description), '') <> '')
)`;

/** Pasaporte de Origen emitido para el producto. */
export const TIENE_PASAPORTE = `EXISTS (
  SELECT 1 FROM digital_identity.product_identity pi
  WHERE pi.product_id = p.id AND pi.is_active
)`;

// ─── Contrato que viaja al frontend ──────────────────────────────────────────

export interface Definition {
  code: string;
  label: string;
  /** Texto exacto del tooltip. */
  formula: string;
  /** Dónde la definición del brief no encaja con el modelo de datos. */
  caveat: string | null;
}

export const DEFINICIONES: Definition[] = [
  {
    code: 'tienda_activa',
    label: 'Unidad productiva activa',
    formula: `Unidad productiva con al menos ${MIN_APPROVED_FOR_ACTIVE} productos aprobados por moderación.`,
    caveat:
      'Aprobar y publicar son dos pasos distintos: una UP puede tener 3 productos aprobados y seguir siendo invisible para el público. El subvalor "visibles al público" es un subconjunto de esta cifra, no una segunda cantidad que se sume.',
  },
  {
    code: 'producto_activo',
    label: 'Producto activo',
    formula:
      'Producto aprobado por moderación, en una tienda publicada y aprobada en marketplace, con ficha técnica completa y precio definido.',
    caveat:
      'Ficha completa = descripción + categoría + al menos una imagen + medidas y peso mayores que cero + oficio y técnica + al menos un material. La narrativa no cuenta como bloqueante: tiene su propia línea de sanidad.',
  },
  {
    code: 'tienda_en_riesgo',
    label: 'Unidad productiva en riesgo',
    formula: `Unidad productiva sin ningún producto publicado, o sin actividad registrada en ${INACTIVITY_DAYS} días.`,
    caveat:
      'Hoy lo domina el gate de publicación de la tienda, no el catálogo del artesano: cualquier UP no publicada tiene 0 publicados aunque tenga productos aprobados. Por eso cada fila trae sus razones desglosadas. "Activa" y "en riesgo" no son excluyentes: una UP con 3 aprobados y sin actividad en 30 días cuenta en ambas.',
  },
  {
    code: 'actividad',
    label: 'Actividad de la unidad productiva',
    formula:
      'La más reciente entre el último inicio de sesión del artesano y la última escritura sobre su catálogo (producto o variante).',
    caveat:
      'Moderar un producto también actualiza su fecha de modificación, así que una tienda moderada pero abandonada puede parecer activa durante ese periodo. Se excluye a propósito la fecha de modificación de la tienda, que se mueve cada vez que un administrador la toca.',
  },
  {
    code: 'catalogo_completo',
    label: 'Catálogo completo',
    formula:
      'Unidad productiva con al menos un producto, en la que todos sus productos tienen ficha técnica completa y precio definido.',
    caveat:
      'El brief lista "catálogos completos" entre métricas de producto, pero un catálogo es de la unidad productiva. Se implementa la lectura literal y la alternativa (número de productos con ficha completa) viaja como subvalor. Definición pendiente de confirmación del Ministerio.',
  },
  {
    code: 'datos_bancarios',
    label: 'Datos bancarios verificados',
    formula:
      'La unidad productiva tiene identificador de contraparte en la pasarela de pagos, es decir, sus datos bancarios fueron aceptados y verificados.',
    caveat:
      'Se reporta únicamente la presencia y el estado de verificación. Nunca el número de cuenta, la entidad ni ningún dato financiero de la persona. El campo autodeclarado bank_data_status casi no se escribe (2 de 172 unidades) y no se usa como señal principal; aparece solo como sub-razón.',
  },
  {
    code: 'pasaporte_origen',
    label: 'Pasaporte de Origen',
    formula:
      'Certificado digital emitido por producto (digital_identity.product_identity activo).',
    caveat:
      'El pasaporte se emite por producto, no por artesano. "Artesanos con pasaporte" se deriva contando unidades productivas distintas con al menos uno emitido.',
  },
];

/** Caveats comunes a todos los endpoints del módulo. */
export const CAVEATS_COMUNES: string[] = [
  'Aprobar y publicar son dos pasos distintos: una unidad productiva puede tener productos aprobados y seguir siendo invisible para el público.',
  'El rango de fechas filtra unidades productivas por su fecha de creación (cohorte). Todas las métricas, incluidas las de producto, se calculan sobre las UP creadas en esa ventana — no sobre la actividad ocurrida en ella.',
  'Este tablero lee shop.products_core (sistema vigente). El sistema legacy shop.products no se considera; algunas pantallas antiguas del back office pueden mostrar cifras distintas por esa razón.',
  'Región, departamento y municipio son texto libre sin normalizar. Los filtros son de igualdad exacta; usa los valores que ofrece el propio selector.',
  'Los datos bancarios y de identidad se reportan solo como presencia y estado de verificación. Ningún número de documento, RUT, teléfono, dirección ni identificador de contraparte sale de la base de datos.',
  'La aprobación en marketplace tiene dos columnas que hoy divergen: el estado textual marca 30 unidades aprobadas y la bandera booleana unas 96. Se considera aprobada si cualquiera de las dos lo indica, para no subcontar.',
  'Sin filtro de convenio ni de fechas, el tablero mezcla todo el padrón histórico (172 unidades, casi todas de Artesanías de Colombia) con el programa que se quiera medir. Para leer un convenio concreto, filtra por convenio o por la ventana de creación de su cohorte.',
];
