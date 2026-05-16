import React from 'react';
import { SANS, GREEN_MOD } from '@/components/dashboard/dashboardStyles';
import { EMPTY_STATE_COPY } from '@/constants/moderation-copy';

interface QueueEmptyStateProps {
  type?: keyof typeof EMPTY_STATE_COPY;
}

export const QueueEmptyState: React.FC<QueueEmptyStateProps> = ({
  type = 'default',
}) => {
  const copy = EMPTY_STATE_COPY[type] ?? EMPTY_STATE_COPY.default;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 16px', textAlign: 'center' }}>
      <div style={{
        borderRadius: 9999, background: 'rgba(21,128,61,0.08)', padding: 16, marginBottom: 16,
        border: '1px solid rgba(21,128,61,0.15)',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 32, color: GREEN_MOD, display: 'block' }}>
          check_circle
        </span>
      </div>
      <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: '#151b2d', margin: 0 }}>{copy.title}</p>
      <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.55)', marginTop: 4, maxWidth: 280, lineHeight: 1.5 }}>{copy.description}</p>
    </div>
  );
};
