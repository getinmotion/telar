/**
 * Utilidades para colores semánticos del sistema de diseño
 * Mapea colores hardcodeados a tokens del tema
 */

export const statusColors = {
  completed: {
    bg: 'bg-success/20',
    text: 'text-success',
    border: 'border-success/30',
    icon: 'text-success',
  },
  in_progress: {
    bg: 'bg-primary/20',
    text: 'text-primary',
    border: 'border-primary/30',
    icon: 'text-primary',
  },
  pending: {
    bg: 'bg-warning/20',
    text: 'text-warning-foreground',
    border: 'border-warning/30',
    icon: 'text-warning',
  },
  cancelled: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-border',
    icon: 'text-muted-foreground',
  },
  error: {
    bg: 'bg-destructive/20',
    text: 'text-destructive',
    border: 'border-destructive/30',
    icon: 'text-destructive',
  },
};

export const priorityColors = {
  high: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    border: 'border-destructive/20',
    gradient: 'from-destructive to-destructive/80',
  },
  medium: {
    bg: 'bg-warning/10',
    text: 'text-warning-foreground',
    border: 'border-warning/20',
    gradient: 'from-warning to-warning/80',
  },
  low: {
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/20',
    gradient: 'from-success to-success/80',
  },
};

export const scoreColors = {
  high: 'text-success',      // >= 70
  medium: 'text-warning',    // >= 40
  low: 'text-destructive',   // < 40
};

export const categoryColors = {
  financial: 'text-success',
  legal: 'text-primary',
  diagnostic: 'text-accent',
  commercial: 'text-warning',
  operational: 'text-secondary',
  community: 'text-accent',
};

export function getStatusColors(status: string) {
  return statusColors[status as keyof typeof statusColors] || statusColors.pending;
}

export function getPriorityColors(priority: string) {
  return priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium;
}

export function getScoreColor(score: number) {
  if (score >= 70) return scoreColors.high;
  if (score >= 40) return scoreColors.medium;
  return scoreColors.low;
}
