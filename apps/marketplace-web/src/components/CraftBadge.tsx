import { Badge } from "@/components/ui/badge";
import { getCraftIcon } from "@/lib/craftUtils";
import { cn } from "@/lib/utils";
import { normalizeCraft } from "@/lib/normalizationUtils";

interface CraftBadgeProps {
  craft: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "secondary";
  showIcon?: boolean;
}

export const CraftBadge = ({ 
  craft, 
  size = "md", 
  variant = "outline",
  showIcon = true 
}: CraftBadgeProps) => {
  const normalizedCraft = normalizeCraft(craft);
  const Icon = getCraftIcon(normalizedCraft);
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-1.5 gap-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <Badge 
      variant={variant} 
      className={cn("font-medium", sizeClasses[size])}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{normalizedCraft}</span>
    </Badge>
  );
};
