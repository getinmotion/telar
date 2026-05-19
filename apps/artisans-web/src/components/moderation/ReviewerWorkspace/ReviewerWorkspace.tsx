import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WorkspaceLeft } from './WorkspaceLeft';
import { WorkspaceRight } from './WorkspaceRight';
import { ApprovalMode } from './modes/ApprovalMode';
import { CorrectionMode } from './modes/CorrectionMode';
import { RejectionMode, type RejectionReasonType } from './modes/RejectionMode';
import { RequestChangesMode } from './modes/RequestChangesMode';
import { SANS } from '@/components/dashboard/dashboardStyles';
import type { ModerationProduct, ModerationHistory as ModerationHistoryType } from '@/hooks/useProductModeration';
import type { FieldCorrection } from './CorrectionTypeSelector';

type WorkspaceMode = 'approval' | 'correction' | 'request_changes' | 'rejection';

interface ReviewerWorkspaceProps {
  product: ModerationProduct;
  history: ModerationHistoryType[];
  onModerate: (
    action: 'approve' | 'approve_with_edits' | 'request_changes' | 'reject',
    comment?: string,
    edits?: Record<string, unknown>,
    rejectionReason?: RejectionReasonType,
    corrections?: FieldCorrection[],
  ) => Promise<void>;
  moderating: boolean;
}

type ModeConfig = {
  label: string;
  icon: string;
  color: string;
  rgba: (a: number) => string;
};

const MODE_CONFIG: Record<WorkspaceMode, ModeConfig> = {
  approval:        { label: 'Aprobar',      icon: 'check_circle',  color: '#15803d', rgba: (a) => `rgba(21,128,61,${a})` },
  correction:      { label: 'Corregir',     icon: 'edit',          color: '#2563eb', rgba: (a) => `rgba(37,99,235,${a})` },
  request_changes: { label: 'Pedir cambios',icon: 'chat',          color: '#d97706', rgba: (a) => `rgba(245,158,11,${a})` },
  rejection:       { label: 'No publicar',  icon: 'cancel',        color: '#dc2626', rgba: (a) => `rgba(239,68,68,${a})` },
};

const MODE_ORDER: WorkspaceMode[] = ['approval', 'correction', 'request_changes', 'rejection'];

export const ReviewerWorkspace: React.FC<ReviewerWorkspaceProps> = ({
  product,
  history,
  onModerate,
  moderating,
}) => {
  const [mode, setMode] = useState<WorkspaceMode>('approval');
  const [hoveredMode, setHoveredMode] = useState<WorkspaceMode | null>(null);
  const cfg = MODE_CONFIG[mode];

  const handleApprove = async (comment?: string) => {
    await onModerate('approve', comment);
  };

  const handleApproveWithEdits = async (edits: Record<string, unknown>, corrections: FieldCorrection[], comment?: string) => {
    await onModerate('approve_with_edits', comment, edits, undefined, corrections);
  };

  const handleRequestChanges = async (comment: string) => {
    await onModerate('request_changes', comment);
  };

  const handleReject = async (reason: RejectionReasonType, comment: string) => {
    await onModerate('reject', comment, undefined, reason);
  };

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 0, flexDirection: 'column' }}>
      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(84,67,62,0.1)', background: 'rgba(249,247,242,0.95)', padding: '8px 12px', flexShrink: 0 }}>
        {MODE_ORDER.map((value) => {
          const { label, icon, color, rgba } = MODE_CONFIG[value];
          const isActive = mode === value;
          const isHovered = hoveredMode === value;
          return (
            <button
              key={value}
              onClick={() => setMode(value)}
              onMouseEnter={() => setHoveredMode(value)}
              onMouseLeave={() => setHoveredMode(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                borderRadius: 8, padding: '6px 12px',
                background: isActive ? color : isHovered ? rgba(0.06) : 'transparent',
                color: isActive ? 'white' : isHovered ? color : 'rgba(84,67,62,0.45)',
                border: 'none', cursor: 'pointer',
                fontFamily: SANS, fontSize: 12, fontWeight: 600,
                transition: 'all 0.12s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{icon}</span>
              {label}
            </button>
          );
        })}
      </div>

      {/* 3-column layout */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* LEFT — producto vivo */}
        <div style={{ width: 280, flexShrink: 0, borderRight: '1px solid rgba(84,67,62,0.08)', overflowY: 'auto', background: 'white' }}>
          <WorkspaceLeft product={product} />
        </div>

        {/* CENTER — panel del modo activo */}
        <div style={{
          flex: 1, minWidth: 0, borderRight: '1px solid rgba(84,67,62,0.08)', overflowY: 'auto',
          background: cfg.rgba(0.03),
          borderTop: `3px solid ${cfg.color}`,
        }}>
          <ScrollArea className="h-full">
            {mode === 'approval' && (
              <ApprovalMode onApprove={handleApprove} moderating={moderating} />
            )}
            {mode === 'correction' && (
              <CorrectionMode product={product} onApproveWithEdits={handleApproveWithEdits} moderating={moderating} />
            )}
            {mode === 'request_changes' && (
              <RequestChangesMode onRequestChanges={handleRequestChanges} moderating={moderating} />
            )}
            {mode === 'rejection' && (
              <RejectionMode onReject={handleReject} moderating={moderating} />
            )}
          </ScrollArea>
        </div>

        {/* RIGHT — IA + score + historial */}
        <div style={{ width: 260, flexShrink: 0, overflow: 'hidden', background: 'white' }}>
          <WorkspaceRight product={product} history={history} />
        </div>
      </div>
    </div>
  );
};
