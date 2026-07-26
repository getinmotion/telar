import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WorkspaceLeft } from './WorkspaceLeft';
import { WorkspaceRight } from './WorkspaceRight';
import { ApprovalMode } from './modes/ApprovalMode';
import { CorrectionMode } from './modes/CorrectionMode';
import { RejectionMode, type RejectionReasonType } from './modes/RejectionMode';
import { RequestChangesMode } from './modes/RequestChangesMode';
import { SANS } from '@/components/dashboard/dashboardStyles';
import { cn } from '@/lib/utils';
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
      <div className="flex gap-1 border-b border-stone-900/10 bg-stone-50/95 px-3 py-2 shrink-0">
        {MODE_ORDER.map((value) => {
          const { label, icon, color, rgba } = MODE_CONFIG[value];
          const isActive = mode === value;
          return (
            <button
              key={value}
              onClick={() => setMode(value)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border-none cursor-pointer"
              style={{
                background: isActive ? color : 'transparent',
                color: isActive ? 'white' : 'rgba(84,67,62,0.5)',
              }}
              onMouseEnter={(e) => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = rgba(0.07); (e.currentTarget as HTMLElement).style.color = color; } }}
              onMouseLeave={(e) => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(84,67,62,0.5)'; } }}
            >
              <span className="material-symbols-outlined text-[14px]">{icon}</span>
              {label}
            </button>
          );
        })}
      </div>

      {/* 2-column layout — left wider, right stacks mode + AI */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* LEFT — producto vivo */}
        <div style={{ borderRight: '1px solid rgba(84,67,62,0.08)', overflowY: 'auto', background: 'white' }}>
          <WorkspaceLeft product={product} />
        </div>

        {/* RIGHT — mode panel + AI/score/historial stacked vertically */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          {/* Mode panel */}
          <div style={{
            flex: 1, overflowY: 'auto',
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

          {/* AI + score + historial */}
          <div style={{ borderTop: '1px solid rgba(84,67,62,0.08)', overflow: 'hidden', background: 'white' }}>
            <WorkspaceRight product={product} history={history} />
          </div>
        </div>
      </div>
    </div>
  );
};
