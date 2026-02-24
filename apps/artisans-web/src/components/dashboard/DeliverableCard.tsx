
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Image,
  FileCode,
  File
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { AgentDeliverable } from '@/hooks/useAgentDeliverables';
import { DeliverableActions } from './DeliverableActions';

interface DeliverableCardProps {
  deliverable: AgentDeliverable;
  language: 'en' | 'es';
}

export const DeliverableCard: React.FC<DeliverableCardProps> = ({
  deliverable,
  language
}) => {
  const t = {
    en: {
      createdAt: "Created"
    },
    es: {
      createdAt: "Creado"
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'image': 
      case 'png':
      case 'jpg':
      case 'jpeg': return <Image className="w-5 h-5 text-green-500" />;
      case 'code':
      case 'html':
      case 'css':
      case 'js': return <FileCode className="w-5 h-5 text-blue-500" />;
      case 'text': return <FileText className="w-5 h-5 text-gray-500" />;
      default: return <File className="w-5 h-5 text-purple-500" />;
    }
  };

  const getFileTypeColor = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf': return 'bg-red-100 text-red-800 border-red-200';
      case 'image': 
      case 'png':
      case 'jpg':
      case 'jpeg': return 'bg-green-100 text-green-800 border-green-200';
      case 'code':
      case 'html':
      case 'css':
      case 'js': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'text': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="mt-1">
              {getFileIcon(deliverable.file_type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate mb-1">
                {deliverable.title}
              </h4>
              
              {deliverable.description && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {deliverable.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <Badge className={`text-xs ${getFileTypeColor(deliverable.file_type)}`}>
                  {deliverable.file_type.toUpperCase()}
                </Badge>
                <span>
                  {t[language].createdAt}: {formatDistanceToNow(new Date(deliverable.created_at), { 
                    addSuffix: true,
                    locale: language === 'es' ? es : undefined
                  })}
                </span>
              </div>
            </div>
          </div>

          <DeliverableActions deliverable={deliverable} language={language} />
        </div>
      </CardContent>
    </Card>
  );
};
