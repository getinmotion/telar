import { LayoutList, Grid2x2, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type MobileViewMode = "1-col" | "2-col" | "list";

interface MobileViewToggleProps {
  mode: MobileViewMode;
  onModeChange: (mode: MobileViewMode) => void;
}

export const MobileViewToggle = ({ mode, onModeChange }: MobileViewToggleProps) => {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 border rounded-lg p-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={mode === "1-col" ? "default" : "ghost"}
              size="sm"
              onClick={() => onModeChange("1-col")}
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
              variant={mode === "2-col" ? "default" : "ghost"}
              size="sm"
              onClick={() => onModeChange("2-col")}
              className="h-8 w-8 p-0"
            >
              <Grid2x2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>2 columnas</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={mode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onModeChange("list")}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Lista</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
