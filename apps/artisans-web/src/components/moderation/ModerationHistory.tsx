import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModerationStatusBadge } from './ModerationStatusBadge';
import { ArrowRight, MessageSquare, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ModerationHistory as ModerationHistoryType } from '@/hooks/useProductModeration';

interface ModerationHistoryProps {
  history: ModerationHistoryType[];
}

export const ModerationHistory: React.FC<ModerationHistoryProps> = ({ history }) => {
  if (history.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Historial de Moderación
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.map((entry, idx) => (
            <div 
              key={entry.id} 
              className="border rounded-lg p-3 bg-muted/30"
            >
              <div className="flex items-center gap-2 mb-2">
                {entry.previous_status && (
                  <>
                    <ModerationStatusBadge status={entry.previous_status} size="sm" />
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </>
                )}
                <ModerationStatusBadge status={entry.new_status} size="sm" />
                <span className="text-xs text-muted-foreground ml-auto">
                  {formatDistanceToNow(new Date(entry.created_at), { 
                    addSuffix: true, 
                    locale: es 
                  })}
                </span>
              </div>
              {entry.comment && (
                <div className="flex items-start gap-2 mt-2 text-sm">
                  <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <p className="text-muted-foreground">{entry.comment}</p>
                </div>
              )}
              {entry.edits_made && Object.keys(entry.edits_made).length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="font-medium">Campos editados:</span>{' '}
                  {Object.keys(entry.edits_made).join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};