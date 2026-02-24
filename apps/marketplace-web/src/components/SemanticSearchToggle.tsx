import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SemanticSearchToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

export const SemanticSearchToggle = ({ 
  enabled, 
  onToggle,
  className = ""
}: SemanticSearchToggleProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-2 ${className}`}>
            <Switch
              id="semantic-search"
              checked={enabled}
              onCheckedChange={onToggle}
              className="data-[state=checked]:bg-primary"
            />
            <Label
              htmlFor="semantic-search"
              className="flex items-center gap-1.5 cursor-pointer text-sm font-medium"
            >
              <Sparkles className={`h-4 w-4 ${enabled ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={enabled ? 'text-foreground' : 'text-muted-foreground'}>
                IA
              </span>
            </Label>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="font-semibold mb-1">
            {enabled ? '✨ Búsqueda Inteligente Activada' : '🔍 Búsqueda Simple'}
          </p>
          <p className="text-xs text-muted-foreground">
            {enabled 
              ? 'Usa inteligencia artificial para entender el significado de tu búsqueda. Encuentra productos similares aunque no contengan las palabras exactas.'
              : 'Búsqueda tradicional por palabras clave. Solo encuentra productos que contengan exactamente el texto que escribes.'
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

