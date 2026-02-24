import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VoiceInput } from '@/components/ui/voice-input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Scale, CheckCircle2, Circle, AlertTriangle, FileCheck, ExternalLink, Phone, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import confetti from 'canvas-confetti';
import { useUnifiedUserData } from '@/hooks/user/useUnifiedUserData';
import { EventBus } from '@/utils/eventBus';

interface LegalGuideModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
  stepTitle: string;
}

interface LegalStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  notes: string;
  documents: string[];
  estimatedDays: number;
}

const RUT_STEPS: LegalStep[] = [
  {
    id: 'documento-identidad',
    title: 'Reunir Documento de Identidad',
    description: 'Cédula de ciudadanía o extranjería vigente',
    completed: false,
    notes: '',
    documents: ['Cédula original y copia'],
    estimatedDays: 0
  },
  {
    id: 'camara-comercio',
    title: 'Ir a Cámara de Comercio',
    description: 'Acudir a la Cámara de Comercio de tu ciudad para solicitar el RUT',
    completed: false,
    notes: '',
    documents: ['Formulario de registro', 'Cédula'],
    estimatedDays: 1
  },
  {
    id: 'diligenciar-formulario',
    title: 'Diligenciar Formulario RUT',
    description: 'Completar el formulario de inscripción con tus datos',
    completed: false,
    notes: '',
    documents: ['Formulario RUT completo'],
    estimatedDays: 0
  },
  {
    id: 'pagar-registro',
    title: 'Pagar Derechos de Registro',
    description: 'Pagar el valor correspondiente (aproximadamente $30.000 - $50.000 COP)',
    completed: false,
    notes: '',
    documents: ['Recibo de pago'],
    estimatedDays: 0
  },
  {
    id: 'recibir-rut',
    title: 'Recibir RUT',
    description: 'Esperar la emisión de tu RUT provisional o definitivo',
    completed: false,
    notes: '',
    documents: ['RUT impreso'],
    estimatedDays: 1
  }
];

export const LegalGuideModal: React.FC<LegalGuideModalProps> = ({
  open,
  onClose,
  onComplete,
  stepTitle
}) => {
  const { toast } = useToast();
  const { updateProfile, profile } = useUnifiedUserData();
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<LegalStep[]>(RUT_STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [rutNumber, setRutNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuide, setShowGuide] = useState<boolean | null>(null); // null = loading, true = guía, false = formulario simple

  // Determinar vista inicial basada en si tiene RUT (con timeout de seguridad)
  useEffect(() => {
    if (!open) {
      setShowGuide(null); // Reset al cerrar
      return;
    }

    // Timeout de seguridad: si profile no carga en 3 segundos, mostrar formulario simple
    const timeout = setTimeout(() => {
      if (showGuide === null) {
        console.warn('⚠️ LegalGuideModal: Profile no cargó en 3s, mostrando formulario simple');
        setShowGuide(false);
      }
    }, 3000);

    if (profile !== undefined) {
      clearTimeout(timeout);
      console.log('📋 LegalGuideModal: Profile cargado, RUT existente:', profile?.rut || 'ninguno');
      setShowGuide(!profile?.rut); // Si no tiene RUT, mostrar guía
    }

    return () => clearTimeout(timeout);
  }, [open, profile, showGuide]);

  // Initialize RUT from profile if exists
  useEffect(() => {
    if (profile?.rut) {
      setRutNumber(profile.rut);
    }
  }, [profile?.rut]);

  useEffect(() => {
    const completed = steps.filter(s => s.completed).length;
    setProgress((completed / steps.length) * 100);
  }, [steps]);

  const currentStep = steps[currentStepIndex];
  const allStepsCompleted = steps.every(s => s.completed);

  const toggleStepComplete = (stepId: string) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    );
  };

  const updateStepNotes = (stepId: string, notes: string) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId ? { ...step, notes } : step
      )
    );
  };

  const handleSimpleSubmit = async () => {
    const trimmedRut = rutNumber.trim();
    console.log('🔄 LegalGuideModal: Intentando guardar RUT:', trimmedRut);

    if (!trimmedRut) {
      toast({
        title: 'Ingresa tu RUT',
        description: 'El número de RUT es requerido',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📡 LegalGuideModal: Llamando updateProfile...');
      const result = await updateProfile({ 
        rut: trimmedRut, 
        rutPendiente: false 
      });
      console.log('✅ LegalGuideModal: Resultado updateProfile:', result);

      // Emit event for task completion
      EventBus.publish('legal.nit.completed', { 
        rut: trimmedRut,
        completedAt: new Date().toISOString()
      });

      // Force master context refresh
      EventBus.publish('master.context.updated', {
        reason: 'RUT saved via LegalGuideModal'
      });

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
      });

      toast({
        title: '🎉 ¡RUT Registrado!',
        description: 'Tu número de RUT ha sido guardado correctamente'
      });

      onComplete({
        procedure: 'RUT',
        rutNumber: trimmedRut,
        steps: [],
        completionPercentage: 100
      });

      onClose();
    } catch (error: any) {
      console.error('❌ LegalGuideModal: Error saving RUT:', error);
      toast({
        title: 'Error al guardar RUT',
        description: error?.message || 'No se pudo guardar el RUT. Intenta nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuideComplete = async () => {
    const completedSteps = steps.filter(s => s.completed).length;
    
    if (completedSteps === 0) {
      toast({
        title: 'Completa al menos un paso',
        description: 'Marca los pasos que ya has completado',
        variant: 'destructive'
      });
      return;
    }

    // If all steps completed, require RUT number
    if (allStepsCompleted && !rutNumber.trim()) {
      toast({
        title: 'Ingresa tu número de RUT',
        description: 'Para completar el trámite, ingresa el número de RUT que recibiste',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // If RUT number provided, save to database
      if (rutNumber.trim()) {
        await updateProfile({ 
          rut: rutNumber.trim(), 
          rutPendiente: false 
        });

        // Emit event for task completion
        EventBus.publish('legal.nit.completed', { 
          rut: rutNumber.trim(),
          completedAt: new Date().toISOString()
        });

        // Force master context refresh
        EventBus.publish('master.context.updated', {
          reason: 'RUT saved via LegalGuideModal guide flow'
        });

        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 }
        });

        toast({
          title: '🎉 ¡RUT Registrado!',
          description: 'Tu número de RUT ha sido guardado correctamente'
        });
      } else {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        toast({
          title: '⚖️ ¡Progreso registrado!',
          description: `${completedSteps}/${steps.length} pasos completados`
        });
      }

      onComplete({
        procedure: 'RUT',
        rutNumber: rutNumber.trim() || null,
        steps: steps.map(s => ({
          title: s.title,
          completed: s.completed,
          notes: s.notes
        })),
        completionPercentage: (completedSteps / steps.length) * 100
      });

      onClose();
    } catch (error) {
      console.error('Error saving RUT:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el RUT. Intenta nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalEstimatedDays = steps.reduce((acc, step) => acc + step.estimatedDays, 0);

  // ========================================
  // LOADING STATE
  // ========================================
  if (showGuide === null) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ========================================
  // VISTA SIMPLE: Ya tengo RUT
  // ========================================
  if (!showGuide) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Scale className="w-5 h-5 text-primary" />
              Confirmar RUT
            </DialogTitle>
            <DialogDescription>
              Tu RUT está registrado. Puedes actualizarlo si es necesario.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* RUT actual guardado */}
            {profile?.rut && (
              <div className="bg-success/10 border border-success/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span className="font-semibold text-success">RUT Registrado</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tu RUT actual: <span className="font-mono font-semibold text-foreground">{profile.rut}</span>
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="rut-simple">Número de RUT</Label>
              <Input
                id="rut-simple"
                value={rutNumber}
                onChange={(e) => setRutNumber(e.target.value)}
                placeholder="Ej: 12345678-9"
                className="font-mono"
                disabled={isSubmitting}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Formato: números y guiones
              </p>
            </div>

            {/* Useful Links */}
            <div className="bg-muted rounded-lg p-3 space-y-2">
              <h4 className="font-semibold text-sm">Enlaces Útiles</h4>
              <div className="space-y-1">
                <a 
                  href="https://www.ccb.org.co" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  Cámara de Comercio de Bogotá
                </a>
                <a 
                  href="https://www.dian.gov.co" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  DIAN - Información sobre RUT
                </a>
              </div>
            </div>

            {/* Toggle to guide */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGuide(true)}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              ¿No tienes RUT? Ver guía para obtenerlo →
            </Button>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSimpleSubmit} disabled={isSubmitting || !rutNumber.trim()}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Guardar RUT
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ========================================
  // VISTA GUIADA: No tengo RUT - Pasos completos
  // ========================================
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Scale className="w-5 h-5 text-primary" />
            Guía de Trámite: Registro RUT
          </DialogTitle>
          <DialogDescription>
            Te guiaremos paso a paso en el proceso de obtener tu RUT en Colombia
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="h-2 mb-4" />

        {/* Important Alert */}
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-900 dark:text-yellow-100">Tiempo estimado total</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Este trámite puede tomar aproximadamente {totalEstimatedDays} días hábiles. Planifica con tiempo.
            </p>
          </div>
        </div>

        {/* Steps Timeline */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Pasos del Trámite</h3>
          
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Vertical Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border" />
              )}
              
              <div className={`
                border rounded-lg p-4 transition-all
                ${currentStepIndex === index ? 'border-primary bg-primary/5' : 'border-border'}
                ${step.completed ? 'bg-success/10 border-success' : ''}
              `}>
                <div className="flex items-start gap-3">
                  {/* Step Icon */}
                  <div 
                    className="flex-shrink-0 cursor-pointer"
                    onClick={() => toggleStepComplete(step.id)}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="w-8 h-8 text-success" />
                    ) : (
                      <Circle className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                      {step.estimatedDays > 0 && (
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          {step.estimatedDays} día{step.estimatedDays > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Documents Required */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Documentos necesarios:</p>
                      <div className="flex flex-wrap gap-2">
                        {step.documents.map((doc, idx) => (
                          <span key={idx} className="text-xs bg-secondary px-2 py-1 rounded flex items-center gap-1">
                            <FileCheck className="w-3 h-3" />
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Notes with Voice Input */}
                    {currentStepIndex === index && (
                      <div className="space-y-2 pt-2">
                        <label className="text-xs font-medium">Notas sobre este paso:</label>
                        <div className="relative">
                          <Textarea
                            value={step.notes}
                            onChange={(e) => updateStepNotes(step.id, e.target.value)}
                            placeholder="Agrega notas, fechas, o recordatorios..."
                            rows={2}
                            className="pr-12 text-sm"
                          />
                          <div className="absolute right-2 top-2">
                            <VoiceInput
                              onTranscript={(transcript) => {
                                const newNotes = step.notes ? `${step.notes} ${transcript}` : transcript;
                                updateStepNotes(step.id, newNotes);
                              }}
                              language="es"
                              className="h-8 w-8 p-0"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Checkbox to complete */}
                    <div className="flex items-center gap-2 pt-2">
                      <Checkbox
                        checked={step.completed}
                        onCheckedChange={() => toggleStepComplete(step.id)}
                        id={`complete-${step.id}`}
                      />
                      <label 
                        htmlFor={`complete-${step.id}`}
                        className="text-sm cursor-pointer"
                      >
                        Marcar como completado
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RUT Input Section - Only show when all steps completed */}
        {allStepsCompleted && (
          <div className="bg-success/10 border border-success rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <h4 className="font-semibold text-success">¡Todos los pasos completados!</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Ingresa el número de RUT que recibiste para finalizar el trámite.
            </p>
            <div className="space-y-2">
              <Label htmlFor="rut-number">Número de RUT</Label>
              <Input
                id="rut-number"
                value={rutNumber}
                onChange={(e) => setRutNumber(e.target.value)}
                placeholder="Ej: 12345678-9"
                className="font-mono"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Este número quedará registrado en tu perfil
              </p>
            </div>
          </div>
        )}

        {/* Useful Links */}
        <div className="bg-muted rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-sm">Enlaces Útiles</h4>
          <div className="space-y-2">
            <a 
              href="https://www.ccb.org.co" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Cámara de Comercio de Bogotá
            </a>
            <a 
              href="https://www.dian.gov.co" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              DIAN - Información sobre RUT
            </a>
          </div>
        </div>

        {/* Support Contact */}
        <div className="bg-primary/10 rounded-lg p-4 flex items-center gap-3">
          <Phone className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-medium">¿Necesitas ayuda?</p>
            <p className="text-xs text-muted-foreground">
              Llama a la Cámara de Comercio de tu ciudad para asesoría personalizada
            </p>
          </div>
        </div>

        {/* Toggle to simple form */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowGuide(false)}
          className="w-full text-muted-foreground hover:text-foreground"
        >
          ← Ya tengo RUT, solo quiero registrarlo
        </Button>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleGuideComplete} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {allStepsCompleted && rutNumber.trim() ? 'Guardar RUT' : 'Guardar Progreso'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
