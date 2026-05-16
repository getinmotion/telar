import React, { useState } from 'react';
import { CheckCircle, Edit3, XCircle, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WorkspaceLeft } from './WorkspaceLeft';
import { WorkspaceRight } from './WorkspaceRight';
import { ApprovalMode } from './modes/ApprovalMode';
import { CorrectionMode } from './modes/CorrectionMode';
import { RejectionMode, type RejectionReasonType } from './modes/RejectionMode';
import { RequestChangesMode } from './modes/RequestChangesMode';
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

const MODE_CONFIG: Record<WorkspaceMode, {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  tabActive: string;
  tabHover: string;
  panelBg: string;
  topBorder: string;
}> = {
  approval: {
    label: 'Aprobar',
    Icon: CheckCircle,
    tabActive: 'bg-emerald-600 text-white shadow-sm',
    tabHover: 'hover:bg-emerald-50 hover:text-emerald-700',
    panelBg: 'bg-emerald-50/60',
    topBorder: 'border-t-[3px] border-t-emerald-500',
  },
  correction: {
    label: 'Corregir',
    Icon: Edit3,
    tabActive: 'bg-blue-600 text-white shadow-sm',
    tabHover: 'hover:bg-blue-50 hover:text-blue-700',
    panelBg: 'bg-blue-50/50',
    topBorder: 'border-t-[3px] border-t-blue-500',
  },
  request_changes: {
    label: 'Pedir cambios',
    Icon: MessageCircle,
    tabActive: 'bg-amber-500 text-white shadow-sm',
    tabHover: 'hover:bg-amber-50 hover:text-amber-700',
    panelBg: 'bg-amber-50/60',
    topBorder: 'border-t-[3px] border-t-amber-400',
  },
  rejection: {
    label: 'No publicar',
    Icon: XCircle,
    tabActive: 'bg-red-600 text-white shadow-sm',
    tabHover: 'hover:bg-red-50 hover:text-red-700',
    panelBg: 'bg-red-50/60',
    topBorder: 'border-t-[3px] border-t-red-600',
  },
};

const MODE_ORDER: WorkspaceMode[] = ['approval', 'correction', 'request_changes', 'rejection'];

export const ReviewerWorkspace: React.FC<ReviewerWorkspaceProps> = ({
  product,
  history,
  onModerate,
  moderating,
}) => {
  const [mode, setMode] = useState<WorkspaceMode>('approval');
  const cfg = MODE_CONFIG[mode];

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

  const handleRequestChanges = async (comment: string) => {
    await onModerate('request_changes', comment);
  };

  const handleReject = async (reason: RejectionReasonType, comment: string) => {
    await onModerate('reject', comment, undefined, reason);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Mode tabs — cada uno con su color sólido al activarse */}
      <div className="flex gap-1 border-b bg-white px-4 py-2.5 flex-shrink-0">
        {MODE_ORDER.map((value) => {
          const { label, Icon, tabActive, tabHover } = MODE_CONFIG[value];
          const isActive = mode === value;
          return (
            <button
              key={value}
              onClick={() => setMode(value)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all',
                isActive ? tabActive : cn('text-gray-400', tabHover),
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </div>

      {/* 3-column layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* LEFT — producto vivo */}
        <div className="w-[280px] flex-shrink-0 border-r overflow-y-auto bg-white">
          <WorkspaceLeft product={product} />
        </div>

        {/* CENTER — panel con bg y borde superior del modo activo */}
        <div className={cn('flex-1 min-w-0 border-r overflow-y-auto', cfg.panelBg, cfg.topBorder)}>
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
            {mode === 'request_changes' && (
              <RequestChangesMode onRequestChanges={handleRequestChanges} moderating={moderating} />
            )}
            {mode === 'rejection' && (
              <RejectionMode onReject={handleReject} moderating={moderating} />
            )}
          </ScrollArea>
        </div>

        {/* RIGHT — IA + score + historial */}
        <div className="w-[260px] flex-shrink-0 overflow-hidden bg-white">
          <WorkspaceRight product={product} history={history} />
        </div>
      </div>
    </div>
  );
};
