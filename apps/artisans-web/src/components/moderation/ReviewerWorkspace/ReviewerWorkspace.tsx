import React, { useState } from 'react';
import { CheckCircle, Edit3, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WorkspaceLeft } from './WorkspaceLeft';
import { WorkspaceRight } from './WorkspaceRight';
import { ApprovalMode } from './modes/ApprovalMode';
import { CorrectionMode } from './modes/CorrectionMode';
import { RejectionMode, type RejectionReasonType } from './modes/RejectionMode';
import type { ModerationProduct, ModerationHistory as ModerationHistoryType } from '@/hooks/useProductModeration';
import type { FieldCorrection } from './CorrectionTypeSelector';

type WorkspaceMode = 'approval' | 'correction' | 'rejection';

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

const MODES: { value: WorkspaceMode; label: string; Icon: React.ComponentType<any>; colors: string }[] = [
  {
    value: 'approval',
    label: 'Aprobar',
    Icon: CheckCircle,
    colors: 'data-[active=true]:border-emerald-400 data-[active=true]:bg-emerald-50 data-[active=true]:text-emerald-700',
  },
  {
    value: 'correction',
    label: 'Corregir',
    Icon: Edit3,
    colors: 'data-[active=true]:border-teal-400 data-[active=true]:bg-teal-50 data-[active=true]:text-teal-700',
  },
  {
    value: 'rejection',
    label: 'No publicar',
    Icon: XCircle,
    colors: 'data-[active=true]:border-red-400 data-[active=true]:bg-red-50 data-[active=true]:text-red-700',
  },
];

export const ReviewerWorkspace: React.FC<ReviewerWorkspaceProps> = ({
  product,
  history,
  onModerate,
  moderating,
}) => {
  const [mode, setMode] = useState<WorkspaceMode>('approval');

  const handleApprove = async (comment?: string) => {
    await onModerate('approve', comment);
  };

  const handleApproveWithEdits = async (
    edits: Record<string, unknown>,
    corrections: FieldCorrection[],
    comment?: string,
  ) => {
    await onModerate('approve_with_edits', comment, edits, undefined, corrections);
  };

  const handleReject = async (reason: RejectionReasonType, comment: string) => {
    await onModerate('reject', comment, undefined, reason);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Mode tabs */}
      <div className="flex gap-1.5 border-b px-4 py-2 flex-shrink-0">
        {MODES.map(({ value, label, Icon, colors }) => (
          <button
            key={value}
            data-active={mode === value}
            onClick={() => setMode(value)}
            className={cn(
              'flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
              'border-input bg-card text-muted-foreground hover:bg-muted/50',
              colors,
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* 3-column layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* LEFT — producto vivo */}
        <div className="w-[280px] flex-shrink-0 border-r overflow-y-auto">
          <WorkspaceLeft product={product} />
        </div>

        {/* CENTER — modo activo */}
        <div className="flex-1 min-w-0 border-r overflow-y-auto">
          <ScrollArea className="h-full">
            {mode === 'approval' && (
              <ApprovalMode onApprove={handleApprove} moderating={moderating} />
            )}
            {mode === 'correction' && (
              <CorrectionMode
                product={product}
                onApproveWithEdits={handleApproveWithEdits}
                moderating={moderating}
              />
            )}
            {mode === 'rejection' && (
              <RejectionMode onReject={handleReject} moderating={moderating} />
            )}
          </ScrollArea>
        </div>

        {/* RIGHT — IA + score + historial */}
        <div className="w-[260px] flex-shrink-0 overflow-hidden">
          <WorkspaceRight product={product} history={history} />
        </div>
      </div>
    </div>
  );
};
