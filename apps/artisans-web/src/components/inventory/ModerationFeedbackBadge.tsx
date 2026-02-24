import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, CheckCircle, Clock, FileEdit, XCircle, Edit, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ModerationStatus = 
  | 'draft' 
  | 'pending_moderation' 
  | 'approved' 
  | 'approved_with_edits' 
  | 'changes_requested' 
  | 'rejected'
  | 'archived';

interface ModerationFeedbackBadgeProps {
  status: ModerationStatus | string | null;
  comment?: string | null;
  productId?: string;
  productName?: string;
}

const statusConfig: Record<string, {
  label: string;
  icon: React.ReactNode;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className: string;
  showModal: boolean;
}> = {
  draft: {
    label: 'Borrador',
    icon: <FileEdit className="h-3 w-3" />,
    variant: 'outline',
    className: 'text-muted-foreground border-muted-foreground/50',
    showModal: false
  },
  pending_moderation: {
    label: 'En revisión',
    icon: <Clock className="h-3 w-3" />,
    variant: 'outline',
    className: 'text-warning border-warning/50 bg-warning/10',
    showModal: false
  },
  approved: {
    label: 'Aprobado',
    icon: <CheckCircle className="h-3 w-3" />,
    variant: 'outline',
    className: 'text-success border-success/50 bg-success/10',
    showModal: false
  },
  approved_with_edits: {
    label: 'Aprobado',
    icon: <CheckCircle className="h-3 w-3" />,
    variant: 'outline',
    className: 'text-success border-success/50 bg-success/10',
    showModal: false
  },
  changes_requested: {
    label: 'Cambios solicitados',
    icon: <AlertCircle className="h-3 w-3" />,
    variant: 'outline',
    className: 'text-warning border-warning/50 bg-warning/10 cursor-pointer hover:bg-warning/20',
    showModal: true
  },
  rejected: {
    label: 'Rechazado',
    icon: <XCircle className="h-3 w-3" />,
    variant: 'outline',
    className: 'text-destructive border-destructive/50 bg-destructive/10 cursor-pointer hover:bg-destructive/20',
    showModal: true
  },
  archived: {
    label: 'Archivado',
    icon: <FileEdit className="h-3 w-3" />,
    variant: 'outline',
    className: 'text-muted-foreground border-muted-foreground/50',
    showModal: false
  }
};

export const ModerationFeedbackBadge: React.FC<ModerationFeedbackBadgeProps> = ({ 
  status, 
  comment,
  productId,
  productName
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  
  const normalizedStatus = status || 'draft';
  const config = statusConfig[normalizedStatus] || statusConfig.draft;
  
  const isRejected = normalizedStatus === 'rejected';
  const isChangesRequested = normalizedStatus === 'changes_requested';
  const canShowModal = isRejected || isChangesRequested;

  // Always log to debug
  console.log('[ModerationBadge] Rendering:', { status, normalizedStatus, canShowModal, productName });

  const handleBadgeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[ModerationBadge] Click - opening modal');
    setIsModalOpen(true);
  };

  const handleEditProduct = () => {
    if (productId) {
      setIsModalOpen(false);
      navigate(`/productos/editar/${productId}`);
    }
  };

  return (
    <>
      <div className="flex flex-col items-start gap-1">
        <Badge 
          variant={config.variant} 
          className={`${config.className} flex items-center gap-1`}
        >
          {config.icon}
          {config.label}
        </Badge>
        {canShowModal && (
          <button
            type="button"
            onClick={handleBadgeClick}
            className="text-xs text-primary hover:text-primary/80 underline underline-offset-2 font-medium"
          >
            ver razones
          </button>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isRejected ? (
                <>
                  <XCircle className="h-5 w-5 text-destructive" />
                  <span>Producto Rechazado</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-warning" />
                  <span>Cambios Solicitados</span>
                </>
              )}
            </DialogTitle>
            {productName && (
              <DialogDescription className="text-sm">
                {productName}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Feedback del moderador */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-foreground">
                {isRejected ? 'Motivo del rechazo:' : 'Qué debes corregir:'}
              </h4>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {comment || 'No se proporcionó detalle específico.'}
                </p>
              </div>
            </div>

            {/* Qué hacer ahora */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                ¿Qué puedo hacer ahora?
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2 pl-6">
                {isRejected ? (
                  <>
                    <li className="list-disc">Revisa el motivo del rechazo arriba</li>
                    <li className="list-disc">Edita tu producto corrigiendo los problemas indicados</li>
                    <li className="list-disc">Asegúrate de que las fotos sean claras y de buena calidad</li>
                    <li className="list-disc">Verifica que la descripción sea precisa y completa</li>
                    <li className="list-disc">Al guardar, se enviará automáticamente a revisión</li>
                  </>
                ) : (
                  <>
                    <li className="list-disc">Revisa los cambios solicitados arriba</li>
                    <li className="list-disc">Edita tu producto haciendo las correcciones</li>
                    <li className="list-disc">Al guardar, se enviará automáticamente a revisión</li>
                  </>
                )}
              </ul>
            </div>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              {productId && (
                <Button 
                  onClick={handleEditProduct}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Producto
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
