import React from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface AdminSyncIndicatorProps {
  lastUpdated?: number;
  isFetching: boolean;
  isError: boolean;
  onRefresh?: () => void;
}

export const AdminSyncIndicator: React.FC<AdminSyncIndicatorProps> = ({
  lastUpdated,
  isFetching,
  isError,
  onRefresh
}) => {
  const getTimeAgo = () => {
    if (!lastUpdated) return 'Nunca';
    return formatDistanceToNow(new Date(lastUpdated), { addSuffix: true, locale: es });
  };

  if (isFetching) {
    return (
      <Badge variant="outline" className="gap-1.5 text-muted-foreground animate-pulse">
        <RefreshCw className="w-3 h-3 animate-spin" />
        Sincronizando...
      </Badge>
    );
  }

  if (isError) {
    return (
      <Badge 
        variant="destructive" 
        className="gap-1.5 cursor-pointer hover:bg-destructive/80"
        onClick={onRefresh}
      >
        <AlertCircle className="w-3 h-3" />
        Error - Clic para reintentar
      </Badge>
    );
  }

  return (
    <Badge 
      variant="secondary" 
      className="gap-1.5 cursor-pointer hover:bg-secondary/80"
      onClick={onRefresh}
    >
      <CheckCircle2 className="w-3 h-3 text-green-600" />
      <Clock className="w-3 h-3" />
      {getTimeAgo()}
    </Badge>
  );
};
