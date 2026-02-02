/**
 * Deliverable Card - Tarjeta de Entregables
 * 
 * Muestra entregables generados por IA (PDFs, reportes, guías)
 * con vista previa y opciones de descarga.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  FileText, 
  Image, 
  FileJson,
  CheckCircle2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DeliverableCardProps {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'json' | 'report' | 'guide' | 'image';
  agentId: string;
  agentName: string;
  createdAt: Date;
  downloadUrl?: string;
  onDownload: (id: string) => void;
  onView?: (id: string) => void;
}

const typeConfig = {
  pdf: {
    icon: FileText,
    label: 'PDF',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/30'
  },
  json: {
    icon: FileJson,
    label: 'JSON',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    border: 'border-secondary/30'
  },
  report: {
    icon: FileText,
    label: 'Reporte',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30'
  },
  guide: {
    icon: FileText,
    label: 'Guía',
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/30'
  },
  image: {
    icon: Image,
    label: 'Imagen',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30'
  }
};

const DeliverableCardComponent: React.FC<DeliverableCardProps> = ({
  id,
  title,
  description,
  type,
  agentId,
  agentName,
  createdAt,
  downloadUrl,
  onDownload,
  onView
}) => {
  const config = typeConfig[type] || typeConfig.report;
  const Icon = config.icon;

  return (
    <motion.div
      key={id}
      layout
      initial={false}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-elegant">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", config.bg, config.color, config.border)}
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {config.label}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {agentName}
                </Badge>
              </div>

              <CardTitle className="text-lg font-display flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                {title}
              </CardTitle>

              <p className="text-sm text-muted-foreground">
                {description}
              </p>

              <p className="text-xs text-muted-foreground">
                Generado el {createdAt.toLocaleDateString('es-ES', { 
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>

            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                config.bg,
                config.border,
                "border-2"
              )}
            >
              <Icon className={cn("w-6 h-6", config.color)} />
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button
              onClick={() => onDownload(id)}
              className="flex-1 bg-gradient-primary hover:opacity-90"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>

            {onView && (
              <Button
                onClick={() => onView(id)}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ✅ Exportar con React.memo para evitar re-renders innecesarios
export const DeliverableCard = React.memo(DeliverableCardComponent);
