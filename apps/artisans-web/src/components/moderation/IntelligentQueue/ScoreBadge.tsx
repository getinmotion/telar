import React from 'react';
import { cn } from '@/lib/utils';
import { SCORE_LABELS, SCORE_COLORS, getScoreLevel } from '@/constants/moderation-copy';

interface ScoreBadgeProps {
  type: 'priority' | 'risk' | 'commercial';
  score: number;
  className?: string;
  showLabel?: boolean;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({
  type,
  score,
  className,
  showLabel = true,
}) => {
  const level = getScoreLevel(score);
  const colors = SCORE_COLORS[level];
  const label = SCORE_LABELS[type];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        colors.bg,
        colors.text,
        colors.border,
        className,
      )}
      title={`${label}: ${score}/100`}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', colors.dot)} />
      {showLabel && <span className="hidden sm:inline">{label}</span>}
      <span className="font-semibold tabular-nums">{score}</span>
    </span>
  );
};
