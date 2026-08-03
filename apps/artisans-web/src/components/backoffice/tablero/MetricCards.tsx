import React, { useState } from 'react';
import { Info, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type { Definition, MetricCard } from '@/services/gestion.actions';
import {
  METAS_CONVENIO,
  metaLabel,
  metaProgress,
} from '@/config/metasConvenio';
import { SANS, SERIF, lc } from '@/components/dashboard/dashboardStyles';

/**
 * Bloque 1 del brief: fila de tarjetas de estado.
 *
 * Cada tarjeta muestra el número absoluto, el porcentaje sobre meta cuando la
 * meta existe, y la variación semanal cuando es honesta.
 *
 * Dos decisiones que importan:
 *  - `secondary` es un SUBCONJUNTO del valor, no una segunda cifra que se le
 *    sume. Por eso se pinta con "de los cuales", no como otro dato.
 *  - Cuando no hay variación semanal se dice POR QUÉ, en vez de pintar un 0%
 *    que se leería como "no cambió nada". Solo dos de las siete métricas están
 *    respaldadas por una fecha de inserción real.
 */

const PURPLE = '#7c3aed';
const GREEN = '#166534';
const RED = '#dc2626';
const NAVY = '#151b2d';

interface Props {
  cards: MetricCard[];
  definitions: Definition[];
  loading?: boolean;
}

const DeltaBadge: React.FC<{ card: MetricCard }> = ({ card }) => {
  if (!card.delta) {
    return (
      <span
        title={card.deltaUnavailableReason ?? undefined}
        className="inline-flex items-center gap-1 cursor-help"
        style={{ ...lc(0.35), fontSize: 8 }}
      >
        <Minus style={{ width: 9, height: 9 }} />
        sin serie semanal
      </span>
    );
  }
  const { diff, previous7d, pctChange } = card.delta;
  const flat = diff === 0;
  const up = diff > 0;
  const color = flat ? 'rgba(84,67,62,0.45)' : up ? GREEN : RED;
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
  return (
    <span
      className="inline-flex items-center gap-1"
      style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, color }}
      title={`Últimos 7 días: ${card.delta.current7d}. Semana anterior: ${previous7d}.`}
    >
      <Icon style={{ width: 10, height: 10 }} />
      {flat ? 'sin cambios esta semana' : `${up ? '+' : ''}${diff} esta semana`}
      {pctChange != null && !flat ? ` (${up ? '+' : ''}${pctChange}%)` : ''}
    </span>
  );
};

export const MetricCards: React.FC<Props> = ({ cards, definitions, loading }) => {
  const [openTip, setOpenTip] = useState<string | null>(null);
  const defByCode = new Map(definitions.map((d) => [d.code, d]));

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const meta = METAS_CONVENIO[card.code];
        const progress = meta ? metaProgress(card.value, meta) : null;
        const def = defByCode.get(card.definitionCode);
        const isOpen = openTip === card.code;

        return (
          <div
            key={card.code}
            className="tablero-card relative flex flex-col justify-between p-5"
            style={{
              background: 'rgba(255,255,255,0.82)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.65)',
              borderRadius: 22,
              boxShadow: '0 2px 12px rgba(20,34,57,0.06)',
              minHeight: 168,
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <span style={{ ...lc(0.45), fontSize: 9, lineHeight: 1.3 }}>
                {card.label}
              </span>
              {def && (
                <button
                  type="button"
                  onClick={() => setOpenTip(isOpen ? null : card.code)}
                  aria-label={`Cómo se calcula: ${card.label}`}
                  className="shrink-0 print:hidden"
                  style={{ color: isOpen ? PURPLE : 'rgba(20,34,57,0.22)' }}
                >
                  <Info style={{ width: 13, height: 13 }} />
                </button>
              )}
            </div>

            <div className="mt-2">
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: 38,
                  fontWeight: 800,
                  color: NAVY,
                  lineHeight: 1,
                }}
              >
                {loading ? '—' : card.value.toLocaleString('es-CO')}
              </span>
              {meta && (
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'rgba(20,34,57,0.35)',
                    marginLeft: 6,
                  }}
                >
                  / {metaLabel(meta)}
                </span>
              )}
            </div>

            {card.secondary && (
              <p
                style={{
                  fontFamily: SERIF,
                  fontSize: 11.5,
                  fontStyle: 'italic',
                  color: 'rgba(84,67,62,0.5)',
                  marginTop: 4,
                }}
              >
                de los cuales {card.secondary.value.toLocaleString('es-CO')}{' '}
                {card.secondary.label}
              </p>
            )}

            {card.breakdown && (
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                {card.breakdown.map((b) => (
                  <span
                    key={b.code}
                    style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(84,67,62,0.55)' }}
                  >
                    <strong style={{ color: NAVY }}>{b.value}</strong> {b.label.toLowerCase()}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-3">
              {meta && progress != null && (
                <>
                  <div
                    style={{
                      height: 4,
                      background: 'rgba(84,67,62,0.09)',
                      borderRadius: 999,
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${loading ? 0 : progress}%`,
                        background: progress >= 100 ? GREEN : PURPLE,
                        borderRadius: 999,
                        transition: 'width .6s ease',
                      }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span style={{ ...lc(0.35), fontSize: 8 }}>
                      {progress}% de la meta
                    </span>
                    <DeltaBadge card={card} />
                  </div>
                </>
              )}
              {!meta && (
                <div className="flex justify-end">
                  <DeltaBadge card={card} />
                </div>
              )}
            </div>

            {isOpen && def && (
              <div
                className="absolute left-3 right-3 top-10 z-20 rounded-xl p-3 text-left shadow-lg print:hidden"
                style={{
                  background: 'white',
                  border: '1px solid rgba(124,58,237,0.2)',
                }}
              >
                <p
                  style={{
                    fontFamily: SANS,
                    fontSize: 11,
                    fontWeight: 700,
                    color: NAVY,
                    marginBottom: 4,
                  }}
                >
                  {def.label}
                </p>
                <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(20,34,57,0.7)' }}>
                  {def.formula}
                </p>
                {def.caveat && (
                  <p
                    style={{
                      fontFamily: SERIF,
                      fontSize: 10.5,
                      fontStyle: 'italic',
                      color: 'rgba(20,34,57,0.45)',
                      marginTop: 6,
                    }}
                  >
                    {def.caveat}
                  </p>
                )}
                {meta && (
                  <p
                    style={{
                      fontFamily: SANS,
                      fontSize: 10,
                      color: PURPLE,
                      marginTop: 6,
                    }}
                  >
                    Meta {metaLabel(meta)} · {meta.source}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
