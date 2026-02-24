import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CraftTypeEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCraftType: string | null;
  onSave: (craftType: string) => void;
}

const CRAFT_TYPES = [
  { value: 'ceramics', label: 'Cerámica', description: 'Trabajo con greda y arcilla' },
  { value: 'textiles', label: 'Textiles y Tejidos', description: 'Tejidos, bordados y telas' },
  { value: 'woodwork', label: 'Madera', description: 'Carpintería y tallado' },
  { value: 'leather', label: 'Cuero', description: 'Marroquinería y trabajo en cuero' },
  { value: 'jewelry', label: 'Joyería Artesanal', description: 'Joyas y accesorios artesanales' },
  { value: 'basketry', label: 'Cestería y Fibras', description: 'Cestería y trabajo con fibras naturales' },
  { value: 'metalwork', label: 'Metalistería', description: 'Herrería y trabajo en metal' },
  { value: 'stone', label: 'Piedra Tallada', description: 'Tallado y trabajo en piedra' },
  { value: 'cosmetics', label: 'Cosmética Natural', description: 'Productos de cuidado personal artesanales' },
  { value: 'glasswork', label: 'Vidrio Artesanal', description: 'Vitrofusión y trabajo en vidrio' },
  { value: 'paper', label: 'Arte en Papel', description: 'Encuadernación y técnicas en papel' },
  { value: 'mixed', label: 'Técnicas Mixtas', description: 'Combinación de diferentes técnicas' },
];

export const CraftTypeEditDialog: React.FC<CraftTypeEditDialogProps> = ({
  open,
  onOpenChange,
  currentCraftType,
  onSave
}) => {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string>(currentCraftType || '');

  const handleSave = () => {
    if (!selectedType) {
      toast({
        title: "Selección requerida",
        description: "Por favor selecciona un tipo de artesanía",
        variant: "destructive"
      });
      return;
    }

    onSave(selectedType);
    onOpenChange(false);
    toast({
      title: "Tipo actualizado",
      description: "El tipo de artesanía ha sido actualizado exitosamente",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Seleccionar Tipo de Artesanía
          </DialogTitle>
          <DialogDescription>
            Elige el tipo que mejor describe tu trabajo artesanal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup value={selectedType} onValueChange={setSelectedType}>
            <div className="grid gap-3">
              {CRAFT_TYPES.map((type) => (
                <Label
                  key={type.value}
                  htmlFor={type.value}
                  className={`
                    flex items-start space-x-3 space-y-0 rounded-lg border-2 p-4 cursor-pointer
                    transition-all hover:bg-accent
                    ${selectedType === type.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                    }
                  `}
                >
                  <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold leading-none">
                      {type.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                </Label>
              ))}
            </div>
          </RadioGroup>

          <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
            <p className="font-medium mb-2">💡 ¿Por qué es importante?</p>
            <ul className="space-y-1 text-xs">
              <li>• Personaliza las herramientas y misiones según tu tipo de artesanía</li>
              <li>• Te conecta con otros artesanos del mismo rubro</li>
              <li>• Permite recomendaciones más específicas y útiles</li>
              <li>• Ayuda a clasificar mejor tus productos</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!selectedType}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Tipo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
