import { GestionService } from './gestion.service';
import { UP_BASE_CTE } from './gestion-sql';
import { SANIDAD_ISSUES } from './gestion-sanidad.catalog';

/**
 * El brief del Ministerio marca la regla de privacidad como no negociable: el
 * panel muestra si el dato existe y si está verificado, NUNCA su valor.
 *
 * Un comentario no es una garantía. Estos tests fallan si algún valor personal
 * se cuela en una respuesta.
 */

/** Columnas cuyo VALOR jamás puede salir del módulo. */
const PII_COLUMNS = [
  // artesanos.artisan_profile
  'id_number',
  'rut',
  'whatsapp_e164',
  'full_name',
  'first_name',
  'last_name',
  // shop.artisan_shops
  'id_contraparty',
  // shop.addresses
  'street_address',
  'postal_code',
  'dane_code',
];

describe('Gestión · privacidad', () => {
  describe('el CTE compartido booleaniza en SQL, no en TypeScript', () => {
    // El valor no debe cruzar el socket hacia Node: así no puede acabar en un
    // log, en un stack trace ni en un dump de error.
    it.each(PII_COLUMNS)(
      'no proyecta el valor crudo de %s',
      (column) => {
        // Se permite mencionar la columna dentro de una expresión booleana
        // (`col IS NOT NULL AND TRIM(col) <> ''`), pero nunca como alias de
        // salida (`AS col` / `col AS algo`).
        const asOutput = new RegExp(
          `AS\\s+${column}\\b|\\b${column}\\s+AS\\b`,
          'i',
        );
        expect(UP_BASE_CTE).not.toMatch(asOutput);
      },
    );

    it('expone la contraparte de pagos solo como booleano', () => {
      expect(UP_BASE_CTE).toContain('AS has_counterparty');
      expect(UP_BASE_CTE).not.toMatch(/AS\s+id_contraparty/i);
    });

    it('expone identidad y contacto solo como booleanos', () => {
      for (const flag of [
        'has_id_number',
        'has_rut',
        'has_whatsapp',
        'has_address',
        'has_email',
      ]) {
        expect(UP_BASE_CTE).toContain(`AS ${flag}`);
      }
    });
  });

  describe('los predicados de sanidad no leen valores personales', () => {
    // Límite de palabra a propósito: `u.rut_pendiente` es una bandera legítima y
    // no debe confundirse con una lectura de `u.rut`.
    const readsColumn = (sql: string, column: string) =>
      new RegExp(`\\bu\\.${column}\\b`).test(sql);

    it.each(SANIDAD_ISSUES.map((i) => [i.code, i] as const))(
      '%s usa solo banderas derivadas',
      (_code, issue) => {
        const expressions = [
          issue.predicate,
          ...(issue.subReasons ?? []).map((s) => s.expr),
        ];
        for (const sql of expressions) {
          for (const column of PII_COLUMNS) {
            expect(readsColumn(sql, column)).toBe(false);
          }
        }
      },
    );
  });

  describe('los mappers no dejan pasar valores personales', () => {
    // Fila cruda con valores reconocibles en cada campo sensible. Si alguno
    // aparece en el JSON serializado, el mapper está filtrando.
    const CANARIES = {
      id_number: 'CC-99999999',
      rut: 'RUT-8887776',
      whatsapp_e164: '+573001112233',
      id_contraparty: 'CONTRAPARTY-XYZ',
      street_address: 'Calle Falsa 123',
      full_name: 'Nombre Real Del Artesano',
    };

    const rawRow = {
      shop_id: '11111111-1111-1111-1111-111111111111',
      shop_name: 'Taller de prueba',
      shop_slug: 'taller-de-prueba',
      region: 'BOYACÁ',
      department: 'BOYACÁ',
      municipality: 'RÁQUIRA',
      craft_type: 'Alfarería',
      created_at: new Date('2026-01-01T00:00:00Z'),
      active: true,
      creation_status: 'complete',
      creation_step: 5,
      artisan_profile_completed: true,
      bank_data_status: 'not_set',
      has_counterparty: false,
      marketplace_approval_status: 'pending',
      marketplace_approved_at: null,
      publicly_visible: false,
      user_email: 'artesano@example.com',
      agreement_id: null,
      agreement_name: null,
      total_products: 4,
      approved_products: 3,
      published_products: 0,
      pending_products: 1,
      rejected_products: 0,
      changes_requested_products: 0,
      draft_products: 0,
      passports_issued: 0,
      last_product_update: null,
      last_activity_at: null,
      rejection_events: 0,
      last_product_moderation_at: null,
      last_shop_moderation_at: null,
      derived_state: 'en_riesgo',
      is_active_shop: true,
      is_at_risk: true,
      risk_sin_publicados: true,
      risk_sin_actividad: false,
      // Contaminamos la fila a propósito, como si una query descuidada las
      // hubiera traído.
      ...CANARIES,
    };

    it('scoreShop no serializa ningún valor personal', () => {
      const service = new GestionService({} as never);
      // scoreShop es privado por diseño; el test lo alcanza a propósito porque
      // es justo el punto donde una fila cruda se convierte en respuesta.
      const mapped = (service as never as {
        scoreShop: (r: unknown, now: number) => unknown;
      }).scoreShop(rawRow, Date.now());

      const json = JSON.stringify(mapped);
      for (const [field, value] of Object.entries(CANARIES)) {
        expect(json).not.toContain(value);
        expect(json).not.toContain(field);
      }
    });

    it('scoreShop sí conserva las banderas de estado', () => {
      const service = new GestionService({} as never);
      const mapped = (service as never as {
        scoreShop: (r: unknown, now: number) => { metrics: Record<string, unknown> };
      }).scoreShop(rawRow, Date.now());

      // Sin contraparte verificada → no puede cobrar. El estado sí viaja.
      expect(mapped.metrics.cobreReady).toBe(false);
      expect(mapped.metrics.approvedProducts).toBe(3);
    });
  });
});
