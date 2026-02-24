import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Download, Check, Circle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface MissionStep {
  id: string;
  title: string;
  completed: boolean;
}

interface MissionCardProps {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  progress: number;
  steps: MissionStep[];
  agentIcons?: React.ReactNode[];
  hasDeliverable?: boolean;
  onDownloadDeliverable?: (id: string) => void;
  onStepToggle?: (missionId: string, stepId: string) => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  id,
  title,
  description,
  priority,
  progress,
  steps,
  agentIcons = [],
  hasDeliverable = false,
  onDownloadDeliverable,
  onStepToggle
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityConfig = () => {
    switch (priority) {
      case 'high':
        return { color: 'clay-red', label: 'Prioridad Alta', borderColor: 'border-clay-red-500' };
      case 'medium':
        return { color: 'golden-hour', label: 'Prioridad Media', borderColor: 'border-golden-hour-500' };
      case 'low':
        return { color: 'moss-green', label: 'Prioridad Baja', borderColor: 'border-moss-green-400' };
      default:
        return { color: 'wood-brown', label: 'Normal', borderColor: 'border-wood-brown-400' };
    }
  };

  const priorityConfig = getPriorityConfig();
  const completedSteps = steps.filter(s => s.completed).length;

  return (
    <Card className={cn(
      "border-l-4 overflow-hidden shadow-paper hover:shadow-workbench transition-all duration-300",
      priorityConfig.borderColor
    )}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-display font-semibold text-lg text-moss-green-900 mb-1">
            {title}
          </h3>
          <p className="text-sm text-charcoal/80 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
          <Badge
            variant="outline"
            className={cn(
              "ml-3 font-medium",
              priority === 'high' && "border-clay-red-500 text-clay-red-700",
              priority === 'medium' && "border-golden-hour-500 text-golden-hour-700",
              priority === 'low' && "border-moss-green-500 text-moss-green-700"
            )}
          >
            {priorityConfig.label}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-charcoal/90">
              {completedSteps}/{steps.length} pasos completados
            </span>
            <span className="text-sm font-bold text-moss-green-700 bg-moss-green-50 px-2 py-0.5 rounded-full">
              {progress}%
            </span>
          </div>
          <Progress
            value={progress}
            className="h-3 bg-linen-white-300"
          />
        </div>

        {/* Agents & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {agentIcons.length > 0 && (
              <div className="flex -space-x-1">
                {agentIcons.map((icon, index) => (
                  <div
                    key={index}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-moss-green-500 to-moss-green-600 flex items-center justify-center text-white border-3 border-white shadow-md hover:scale-110 transition-transform"
                  >
                    {icon}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {hasDeliverable && onDownloadDeliverable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownloadDeliverable(id)}
                className="border-moss-green-500 text-moss-green-700 hover:bg-moss-green-50 font-medium"
              >
                <Download className="w-4 h-4 mr-1" />
                Descargar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="hover:bg-moss-green-50 font-medium"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Ocultar
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Ver Pasos
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Expandable Steps */}
        {isExpanded && steps.length > 0 && (
          <div className="mt-4 pt-4 border-t border-linen-white-300">
            <div className="space-y-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  onClick={() => onStepToggle?.(id, step.id)}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-moss-green-50/50 cursor-pointer transition-colors border border-transparent hover:border-moss-green-200"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {step.completed ? (
                      <Check className="w-5 h-5 text-moss-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-charcoal/30" />
                    )}
                  </div>
                  <span className={cn(
                    "text-sm leading-relaxed",
                    step.completed 
                      ? "text-charcoal/70 line-through" 
                      : "text-charcoal/90 font-medium"
                  )}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emotional Feedback */}
        {progress === 100 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-moss-green-50 to-golden-hour-50 rounded-lg border border-moss-green-200 animate-fade-in">
            <p className="text-sm font-semibold text-moss-green-800 text-center">
              🎉 ¡Misión completada! Tu oficio crece con cada logro.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
