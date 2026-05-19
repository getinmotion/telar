import React from 'react';
import { SANS, SERIF, lc, glassPrimary, GREEN_MOD } from '@/components/dashboard/dashboardStyles';
import { QueueCard, QueueCardItem, STATUS_ACCENT_COLOR } from './QueueCard';
import { QueueCardSkeleton } from './QueueCardSkeleton';
import type { QueueScoreApi } from '@/services/moderation.actions';

interface KanbanColumn {
  status: string;
  label: string;
}

const COLUMNS: KanbanColumn[] = [
  { status: 'pending_moderation', label: 'Pendiente' },
  { status: 'changes_requested',  label: 'Con cambios' },
  { status: 'rejected',           label: 'Rechazado' },
  { status: 'approved_with_edits',label: 'Aprobado' },
];

interface QueueKanbanProps {
  data: Record<string, QueueCardItem[]>;
  loading: boolean;
  scoresMap?: Record<string, QueueScoreApi>;
  onSelect: (id: string) => void;
  onQuickApprove?: (id: string) => void;
  checkedIds: Set<string>;
  onCheckChange: (id: string, checked: boolean) => void;
}

export const QueueKanban: React.FC<QueueKanbanProps> = ({
  data, loading, scoresMap, onSelect, onQuickApprove, checkedIds, onCheckChange,
}) => {
  return (
    <div style={{ display: 'flex', gap: 12, padding: 16, height: '100%', overflowX: 'auto', alignItems: 'flex-start' }}>
      {COLUMNS.map(col => {
        const items = data[col.status] ?? [];
        const accentColor = STATUS_ACCENT_COLOR[col.status] ?? '#9ca3af';

        return (
          <div
            key={col.status}
            style={{
              ...glassPrimary,
              display: 'flex', flexDirection: 'column',
              width: 240, flexShrink: 0, borderRadius: 14,
              borderTop: `3px solid ${accentColor}`,
              maxHeight: '100%', overflow: 'hidden',
            }}
          >
            {/* Column header */}
            <div style={{ padding: '10px 12px 8px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: accentColor, flexShrink: 0 }} />
              <p style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 700, color: '#151b2d', flex: 1 }}>
                {col.label}
              </p>
              <span style={{
                fontFamily: SANS, fontSize: 10, fontWeight: 800,
                padding: '1px 7px', borderRadius: 9999,
                background: `${accentColor}18`, color: accentColor,
              }}>
                {loading ? '…' : items.length}
              </span>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(21,27,45,0.06)', flexShrink: 0 }} />

            {/* Cards */}
            <div style={{ overflowY: 'auto', padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <QueueCardSkeleton key={i} />)
                : items.length === 0
                  ? (
                    <div style={{ padding: '20px 8px', textAlign: 'center' }}>
                      <p style={{ ...lc(0.3), fontSize: 9 }}>Cola vacía</p>
                    </div>
                  )
                  : items.map(item => (
                    <QueueCard
                      key={item.id}
                      item={item}
                      viewMode="grid"
                      score={scoresMap?.[item.id]}
                      isChecked={checkedIds.has(item.id)}
                      onCheckChange={onCheckChange}
                      onSelect={onSelect}
                      onQuickApprove={item.status === 'pending_moderation' ? onQuickApprove : undefined}
                      onQuickReview={onSelect}
                    />
                  ))
              }
            </div>
          </div>
        );
      })}
    </div>
  );
};
