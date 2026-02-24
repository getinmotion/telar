
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';

interface DeliverablesHeaderProps {
  language: 'en' | 'es';
  count: number;
}

export const DeliverablesHeader: React.FC<DeliverablesHeaderProps> = ({
  language,
  count
}) => {
  const t = {
    en: {
      deliverables: "Deliverables"
    },
    es: {
      deliverables: "Entregables"
    }
  };

  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Package className="w-5 h-5 text-primary" />
        {t[language].deliverables}
      </h3>
      <Badge variant="secondary" className="text-xs">
        {count} {count === 1 ? 'entregable' : 'entregables'}
      </Badge>
    </div>
  );
};
