/**
 * Customer Profiler Modal - FASE 5
 * Modal especializado para definir cliente ideal
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Users, Target } from 'lucide-react';
import { VoiceInput } from '@/components/ui/voice-input';

interface CustomerProfilerModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (customerData: any) => void;
  stepTitle: string;
}

export const CustomerProfilerModal: React.FC<CustomerProfilerModalProps> = ({
  open,
  onClose,
  onComplete,
  stepTitle
}) => {
  const [profile, setProfile] = useState({
    demographic: '',
    needs: '',
    painPoints: '',
    buyingBehavior: ''
  });

  const handleComplete = () => {
    onComplete({
      profile,
      stepCompleted: stepTitle
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Define tu Cliente Ideal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>¿Quién es tu cliente? (edad, género, ubicación)</Label>
            <div className="relative">
              <Textarea
                value={profile.demographic}
                onChange={(e) => setProfile(prev => ({ ...prev, demographic: e.target.value }))}
                placeholder="Ej: Mujeres 30-45 años, urbanas, con poder adquisitivo medio-alto"
                rows={2}
                className="pr-12"
              />
              <div className="absolute right-2 top-2">
                <VoiceInput
                  onTranscript={(text) => setProfile(prev => ({ ...prev, demographic: prev.demographic + ' ' + text }))}
                  language="es"
                  className="h-8 w-8 p-0"
                />
              </div>
            </div>
          </div>

          <div>
            <Label>¿Qué necesidades tiene?</Label>
            <div className="relative">
              <Textarea
                value={profile.needs}
                onChange={(e) => setProfile(prev => ({ ...prev, needs: e.target.value }))}
                placeholder="Ej: Buscan productos únicos, hechos a mano, con historia"
                rows={2}
                className="pr-12"
              />
              <div className="absolute right-2 top-2">
                <VoiceInput
                  onTranscript={(text) => setProfile(prev => ({ ...prev, needs: prev.needs + ' ' + text }))}
                  language="es"
                  className="h-8 w-8 p-0"
                />
              </div>
            </div>
          </div>

          <div>
            <Label>¿Qué problemas resuelves para ellos?</Label>
            <div className="relative">
              <Textarea
                value={profile.painPoints}
                onChange={(e) => setProfile(prev => ({ ...prev, painPoints: e.target.value }))}
                placeholder="Ej: Quieren decoración auténtica que no encuentran en tiendas masivas"
                rows={2}
                className="pr-12"
              />
              <div className="absolute right-2 top-2">
                <VoiceInput
                  onTranscript={(text) => setProfile(prev => ({ ...prev, painPoints: prev.painPoints + ' ' + text }))}
                  language="es"
                  className="h-8 w-8 p-0"
                />
              </div>
            </div>
          </div>

          <div>
            <Label>¿Cómo y dónde compran normalmente?</Label>
            <div className="relative">
              <Textarea
                value={profile.buyingBehavior}
                onChange={(e) => setProfile(prev => ({ ...prev, buyingBehavior: e.target.value }))}
                placeholder="Ej: Compran online, en Instagram, valoran el storytelling"
                rows={2}
                className="pr-12"
              />
              <div className="absolute right-2 top-2">
                <VoiceInput
                  onTranscript={(text) => setProfile(prev => ({ ...prev, buyingBehavior: prev.buyingBehavior + ' ' + text }))}
                  language="es"
                  className="h-8 w-8 p-0"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-accent/10 rounded-lg border border-accent/30">
            <Target className="w-5 h-5 text-accent mb-2" />
            <p className="text-sm text-muted-foreground">
              Conocer bien a tu cliente ideal te ayudará a crear mejores productos, mensajes de marketing más efectivos y precios adecuados.
            </p>
          </div>

          <Button onClick={handleComplete} className="w-full">
            Guardar Perfil de Cliente
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};