/**
 * Utility to replace hardcoded icon colors with semantic tokens
 * This helps maintain WCAG 2.1 AA compliance across icon usage
 */

export const iconColorMap = {
  // Old hardcoded colors → New semantic tokens
  'text-pink-400': 'text-accent',
  'text-pink-300': 'text-accent',
  'text-blue-400': 'text-primary',
  'text-blue-500': 'text-primary',
  'text-purple-400': 'text-primary',
  'text-purple-500': 'text-primary',
  'text-green-400': 'text-success',
  'text-green-500': 'text-success',
  'text-yellow-400': 'text-secondary',
  'text-yellow-500': 'text-secondary',
  'text-red-400': 'text-destructive',
  'text-red-500': 'text-destructive',
} as const;

/**
 * Get semantic color class for icons
 * @param context - The context where the icon is used (e.g., 'primary', 'accent', 'success')
 * @returns Tailwind class for semantic icon color
 */
export function getIconColor(context: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'destructive' = 'primary'): string {
  const colorMap = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    success: 'text-success',
    warning: 'text-warning-foreground',
    destructive: 'text-destructive',
  };
  
  return colorMap[context];
}
