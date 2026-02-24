import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, ExternalLink, Check, Edit2, Loader2 } from 'lucide-react';

interface TrackingInfoProps {
  trackingNumber?: string;
  fulfillmentStatus?: string;
  onSaveTracking: (trackingNumber: string) => Promise<boolean>;
}

export const TrackingInfo: React.FC<TrackingInfoProps> = ({
  trackingNumber,
  fulfillmentStatus,
  onSaveTracking,
}) => {
  const [isEditing, setIsEditing] = useState(!trackingNumber);
  const [inputValue, setInputValue] = useState(trackingNumber || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!inputValue.trim()) return;
    
    setIsSaving(true);
    const success = await onSaveTracking(inputValue.trim());
    setIsSaving(false);
    
    if (success) {
      setIsEditing(false);
    }
  };

  const getServientregaLink = (tracking: string) => {
    return `https://www.servientrega.com/rastreo?guia=${tracking}`;
  };

  if (trackingNumber && !isEditing) {
    return (
      <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg border border-success/20">
        <Truck className="w-4 h-4 text-success flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">Guía Servientrega</p>
          <p className="font-mono font-semibold text-sm text-foreground truncate">
            {trackingNumber}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <a
            href={getServientregaLink(trackingNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-success/20 rounded-md transition-colors"
            title="Rastrear envío"
          >
            <ExternalLink className="w-4 h-4 text-success" />
          </a>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        <Truck className="w-3 h-3" />
        Número de guía Servientrega
      </label>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ej: 123456789"
          className="font-mono text-sm"
          disabled={isSaving}
        />
        <Button
          onClick={handleSave}
          disabled={!inputValue.trim() || isSaving}
          size="sm"
          className="flex-shrink-0"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Check className="w-4 h-4 mr-1" />
              Guardar
            </>
          )}
        </Button>
      </div>
      {trackingNumber && (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => {
            setInputValue(trackingNumber);
            setIsEditing(false);
          }}
        >
          Cancelar
        </Button>
      )}
    </div>
  );
};
