import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { EMPTY_STATE_COPY } from '@/constants/moderation-copy';

interface QueueEmptyStateProps {
  type?: keyof typeof EMPTY_STATE_COPY;
}

export const QueueEmptyState: React.FC<QueueEmptyStateProps> = ({
  type = 'default',
}) => {
  const copy = EMPTY_STATE_COPY[type] ?? EMPTY_STATE_COPY.default;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="rounded-full bg-emerald-50 p-4 mb-4">
        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
      </div>
      <p className="text-sm font-medium text-foreground">{copy.title}</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">{copy.description}</p>
    </div>
  );
};
