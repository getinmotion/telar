
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface MobileStatsCardProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  value?: number;
  progress?: number;
  items?: Array<{
    label: string;
    value: number;
  }>;
  badge?: {
    text: string;
    color: string;
  };
}

export const MobileStatsCard: React.FC<MobileStatsCardProps> = ({
  title,
  icon: Icon,
  iconColor,
  value,
  progress,
  items,
  badge
}) => {
  return (
    <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-white text-base">
          <Icon className={`w-5 h-5 ${iconColor}`} />
          {title}
          {badge && (
            <Badge className={badge.color}>
              {badge.text}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {value !== undefined && (
          <div className="text-center mb-3">
            <div className="text-2xl font-bold text-white mb-1">{value}%</div>
            {progress !== undefined && <Progress value={progress} className="h-2" />}
          </div>
        )}
        
        {items && (
          <div className="space-y-1">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm text-white/70">
                <span>{item.label}</span>
                <span>{item.value}%</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
