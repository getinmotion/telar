import { LayoutList, Grid2x2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type MobileColumns = 1 | 2;

interface MobileColumnsToggleProps {
  columns: MobileColumns;
  onColumnsChange: (columns: MobileColumns) => void;
}

export const MobileColumnsToggle = ({ columns, onColumnsChange }: MobileColumnsToggleProps) => {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 border rounded-lg p-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={columns === 1 ? "default" : "ghost"}
              size="sm"
              onClick={() => onColumnsChange(1)}
              className="h-8 w-8 p-0"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>1 columna</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={columns === 2 ? "default" : "ghost"}
              size="sm"
              onClick={() => onColumnsChange(2)}
              className="h-8 w-8 p-0"
            >
              <Grid2x2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>2 columnas</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
