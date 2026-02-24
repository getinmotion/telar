
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, LucideIcon } from 'lucide-react';

interface AgentModuleCardProps {
  id: string;
  title: string;
  icon: LucideIcon;
  badge?: number | null;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const AgentModuleCard: React.FC<AgentModuleCardProps> = ({
  id,
  title,
  icon: Icon,
  badge,
  isExpanded,
  onToggle,
  children
}) => {
  return (
    <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
      <CardHeader className="pb-3">
        <Button
          variant="ghost"
          onClick={onToggle}
          className="w-full justify-between text-white hover:bg-white/10 p-4 h-auto"
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-primary" />
            <span className="font-medium">{title}</span>
            {badge !== null && badge > 0 && (
              <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary border-primary/30">
                {badge}
              </Badge>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
};
