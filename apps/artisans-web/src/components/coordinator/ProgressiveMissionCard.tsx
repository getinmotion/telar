/**
 * Progressive Mission Card - Tarjeta Gamificada de Misiones
 * 
 * Muestra misiones con pasos progresivos, iconos artesanales,
 * barras de progreso, y animaciones de recompensa.
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Lock, 
  Sparkles, 
  Trophy,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
  Star,
  ArrowRight,
  Calculator,
  Users,
  Calendar,
  Play,
  Scale,
  Package,
  Palette,
  TrendingUp,
  Search as SearchIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { detectTaskWizardRequirement, shouldShowTaskSteps } from '@/utils/taskUtils';
import { formatTaskTitleForDisplay } from '@/hooks/utils/agentTaskUtils';
import { PricingCalculatorModal } from '@/components/tasks/StepSpecificModals/PricingCalculatorModal';
import { CustomerProfilerModal } from '@/components/tasks/StepSpecificModals/CustomerProfilerModal';
import { ContentPlannerModal } from '@/components/tasks/StepSpecificModals/ContentPlannerModal';
import { LegalGuideModal } from '@/components/tasks/StepSpecificModals/LegalGuideModal';
import { InventoryOrganizerModal } from '@/components/tasks/StepSpecificModals/InventoryOrganizerModal';
import { BrandIdentityModal } from '@/components/tasks/StepSpecificModals/BrandIdentityModal';
import { SalesStrategyModal } from '@/components/tasks/StepSpecificModals/SalesStrategyModal';
import { MarketResearchModal } from '@/components/tasks/StepSpecificModals/MarketResearchModal';
import { useUnifiedUserData } from '@/hooks/user/useUnifiedUserData';

interface MissionStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isLocked: boolean;
}

interface ProgressiveMissionCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  steps: MissionStep[];
  progress: number; // 0-100
  estimatedTime: string;
  reward?: string;
  onStartStep: (stepId: string) => void;
  onCompleteStep: (stepId: string) => void;
  onStartMission: () => void;
  isExpanded?: boolean;
  isFixedTask?: boolean; // NEW: Differentiate Fixed Tasks
}

const priorityConfig = {
  high: {
    badge: 'bg-primary/10 text-primary border-primary/30',
    icon: 'text-primary',
    label: 'Alta Prioridad'
  },
  medium: {
    badge: 'bg-accent/10 text-accent-foreground border-accent/30',
    icon: 'text-accent-foreground',
    label: 'Prioridad Media'
  },
  low: {
    badge: 'bg-secondary/10 text-secondary-foreground border-secondary/30',
    icon: 'text-secondary-foreground',
    label: 'Baja Prioridad'
  }
};

// 🌍 Traducciones de categorías (agent_id → nombre legible)
const categoryTranslations: Record<string, string> = {
  'create_shop': 'Tienda',
  'create_brand': 'Marca',
  'brand': 'Marca',
  'inventory': 'Inventario',
  'digital-presence': 'Presencia Digital',
  'growth': 'Crecimiento',
  'shop': 'Tienda',
  'products': 'Productos',
  'marketing': 'Marketing',
  'operations': 'Operaciones',
  'finance': 'Finanzas'
};

const translateCategory = (category: string): string => {
  return categoryTranslations[category] || category;
};

const ProgressiveMissionCardComponent: React.FC<ProgressiveMissionCardProps> = ({
  id,
  title,
  description,
  category,
  priority,
  steps,
  progress,
  estimatedTime,
  reward,
  onStartStep,
  onCompleteStep,
  onStartMission,
  isExpanded: initialExpanded = false,
  isFixedTask = false
}) => {
  const { profile, context } = useUnifiedUserData();
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [completingStep, setCompletingStep] = useState<string | null>(null);
  
  // ✅ FASE 3: Obtener brandName real con priorización correcta
  const brandName = useMemo(() => {
    // Priorizar: conversation_insights > business_profile > profile > fallback
    const insightsBrand = (context?.conversationInsights as any)?.nombre_marca;
    const contextBrand = (context?.businessProfile as any)?.brandName || (context?.businessProfile as any)?.brand_name;
    const profileBrand = profile?.brandName;
    
    const finalBrand = insightsBrand || contextBrand || profileBrand || 'tu negocio';
    
    console.log('[ProgressiveMissionCard] 🏷️ Brand name resolution:', {
      insightsBrand,
      contextBrand,
      profileBrand,
      finalBrand
    });
    
    return finalBrand;
  }, [context, profile]);
  
  const formattedTitle = useMemo(() => {
    if (!title) return title;
    return title
      .replace(/\b(tu negocio|tu empresa|tu proyecto|tu emprendimiento|tu marca|tu startup)\b/gi, brandName)
      .replace(/\b(your business|your company|your project|your startup)\b/gi, brandName);
  }, [title, brandName]);
  
  const formattedDescription = useMemo(() => {
    if (!description) return description;
    return description
      .replace(/\b(tu negocio|tu empresa|tu proyecto|tu emprendimiento|tu marca|tu startup)\b/gi, brandName)
      .replace(/\b(your business|your company|your project|your startup)\b/gi, brandName);
  }, [description, brandName]);
  
  // ✅ FASE 5: Modales específicos por tipo de step
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [salesModalOpen, setSalesModalOpen] = useState(false);
  const [marketModalOpen, setMarketModalOpen] = useState(false);
  const [currentStepForModal, setCurrentStepForModal] = useState<MissionStep | null>(null);

  const getStepAction = (step: MissionStep) => {
    const title = step.title.toLowerCase();
    const description = step.description.toLowerCase();

    if (title.includes('rut') || title.includes('legal') || title.includes('trámite') || title.includes('formaliza')) {
      return { label: 'Abrir Guía Legal', icon: Scale, action: () => { setCurrentStepForModal(step); setLegalModalOpen(true); } };
    }
    if (title.includes('precio') || title.includes('cost') || description.includes('precio')) {
      return { label: 'Abrir Calculadora', icon: Calculator, action: () => { setCurrentStepForModal(step); setPricingModalOpen(true); } };
    }
    if (title.includes('cliente') || title.includes('audiencia') || description.includes('cliente')) {
      return { label: 'Definir Cliente', icon: Users, action: () => { setCurrentStepForModal(step); setCustomerModalOpen(true); } };
    }
    if (title.includes('redes') || title.includes('contenido') || title.includes('social') || description.includes('publicar')) {
      return { label: 'Planificar Contenido', icon: Calendar, action: () => { setCurrentStepForModal(step); setContentModalOpen(true); } };
    }
    if (title.includes('producto') || title.includes('inventario') || title.includes('catálogo') || title.includes('organizar')) {
      return { label: 'Organizar Catálogo', icon: Package, action: () => { setCurrentStepForModal(step); setInventoryModalOpen(true); } };
    }
    if (title.includes('marca') || title.includes('identidad') || title.includes('logo') || title.includes('claim')) {
      return { label: 'Definir Identidad', icon: Palette, action: () => { setCurrentStepForModal(step); setBrandModalOpen(true); } };
    }
    if (title.includes('venta') || title.includes('canal') || title.includes('estrategia') || description.includes('comercial')) {
      return { label: 'Planificar Ventas', icon: TrendingUp, action: () => { setCurrentStepForModal(step); setSalesModalOpen(true); } };
    }
    if (title.includes('mercado') || title.includes('competencia') || title.includes('investigación') || title.includes('análisis')) {
      return { label: 'Investigar Mercado', icon: SearchIcon, action: () => { setCurrentStepForModal(step); setMarketModalOpen(true); } };
    }
    return { label: 'Comenzar Paso', icon: Play, action: () => onStartStep(step.id) };
  };

  const handleModalComplete = async (data: any) => {
    if (currentStepForModal) {
      await handleCompleteStep(currentStepForModal.id);
      setCurrentStepForModal(null);
    }
  };

  // Detectar si esta tarea requiere un wizard
  const taskMetadata = detectTaskWizardRequirement({ title, description });
  const showSteps = shouldShowTaskSteps({ title, description, steps });

  const config = priorityConfig[priority];
  const completedSteps = steps.filter(s => s.isCompleted).length;
  const totalSteps = steps.length;
  const isComplete = progress === 100;

  const handleCompleteStep = async (stepId: string) => {
    setCompletingStep(stepId);
    await onCompleteStep(stepId);
    setTimeout(() => setCompletingStep(null), 1000);
  };

  return (
    <motion.div
      key={id}
      layout
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Card className={cn(
        "border transition-all duration-300 hover:shadow-lg overflow-hidden rounded-xl bg-card",
        isComplete 
          ? "border-primary/30 bg-primary/5" 
          : "border-border hover:border-primary/30 hover:bg-card/80"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {isFixedTask && (
                  <Badge className="text-xs font-medium px-2 py-0.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                    <Target className="w-3 h-3 mr-1" />
                    🎯 Misión Progresiva
                  </Badge>
                )}
                {!isFixedTask && (
                  <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5">
                    {translateCategory(category)}
                  </Badge>
                )}
                <Badge variant="outline" className={cn("text-xs font-medium", config.badge)}>
                  {config.label}
                </Badge>
                {reward && (
                  <Badge variant="outline" className="text-xs bg-accent/20 text-accent-foreground border-accent/40 font-medium">
                    <Trophy className="w-3 h-3 mr-1" />
                    {reward}
                  </Badge>
                )}
              </div>

              <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                ) : (
                  <Sparkles className={cn("w-5 h-5 flex-shrink-0", config.icon)} />
                )}
                {formattedTitle}
              </CardTitle>

              <p className="text-sm text-foreground/70 line-clamp-2">
                {formattedDescription}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground/60 flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3" />
                {estimatedTime}
              </span>
              {/* Solo mostrar conteo de pasos si hay pasos reales y no es wizard sin pasos */}
              {showSteps && totalSteps > 0 && (
                <span className="font-medium text-primary">
                  {completedSteps}/{totalSteps} pasos completados
                </span>
              )}
              {(!showSteps || totalSteps === 0) && (
                <span className="font-medium text-primary">
                  {progress}% completado
                </span>
              )}
            </div>
            <Progress 
              value={progress} 
              className="h-2"
            />
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="pt-0 space-y-3">
                {/* Wizard Direct Action - NO STEPS */}
                {taskMetadata.requiresWizard && !showSteps ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-sm text-muted-foreground mb-3">
                        Esta tarea se completa a través de un asistente interactivo que te guiará paso a paso.
                      </p>
                      <Button
                        onClick={onStartMission}
                        className="w-full bg-gradient-primary hover:opacity-90"
                        size="lg"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {taskMetadata.wizardType === 'brand' && 'Abrir Asistente de Marca'}
                        {taskMetadata.wizardType === 'product' && 'Subir Primer Producto'}
                        {taskMetadata.wizardType === 'shop' && 'Crear Mi Tienda'}
                        {taskMetadata.wizardType === 'maturity' && 'Hacer Test de Madurez'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                    
                    {reward && (
                      <div className="p-3 bg-accent/10 rounded-lg border border-accent/20 text-center">
                        <Trophy className="w-5 h-5 mx-auto mb-2 text-accent" />
                        <p className="text-sm font-medium text-accent-foreground">
                          Recompensa al completar: {reward}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Steps List - Solo para tareas normales */
                  <div className="space-y-2">
                    {steps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border transition-all",
                        step.isCompleted 
                          ? "bg-primary/5 border-primary/30" 
                          : step.isLocked
                          ? "bg-muted/30 border-muted"
                          : "bg-card border-border hover:border-primary/40"
                      )}
                    >
                      {/* Step Icon */}
                      <div className="shrink-0 mt-0.5">
                        {step.isCompleted ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          </motion.div>
                        ) : step.isLocked ? (
                          <Lock className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <Circle className="w-5 h-5 text-primary" />
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={cn(
                            "font-medium text-sm",
                            step.isCompleted && "text-primary",
                            step.isLocked && "text-muted-foreground"
                          )}>
                            {formatTaskTitleForDisplay(step.title, brandName)}
                          </h4>
                          {step.isCompleted && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                            >
                              <Star className="w-4 h-4 text-accent fill-accent" />
                            </motion.div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatTaskTitleForDisplay(step.description, brandName)}
                        </p>

                        {/* Step Actions - ✅ FASE 5: Acciones específicas por tipo */}
                        {!step.isCompleted && !step.isLocked && (() => {
                          const stepAction = getStepAction(step);
                          const Icon = stepAction.icon;
                          return (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={stepAction.action}
                              disabled={completingStep === step.id}
                              className="mt-2 text-xs"
                            >
                              <Icon className="w-3 h-3 mr-1" />
                              {completingStep === step.id ? 'Guardando...' : stepAction.label}
                            </Button>
                          );
                        })()}
                      </div>
                    </motion.div>
                  ))}
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Modals */}
      <PricingCalculatorModal
        open={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
        onComplete={handleModalComplete}
        stepTitle={currentStepForModal?.title || ''}
      />
      <CustomerProfilerModal
        open={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        onComplete={handleModalComplete}
        stepTitle={currentStepForModal?.title || ''}
      />
      <ContentPlannerModal
        open={contentModalOpen}
        onClose={() => setContentModalOpen(false)}
        onComplete={handleModalComplete}
        stepTitle={currentStepForModal?.title || ''}
      />
      <LegalGuideModal
        open={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        onComplete={handleModalComplete}
        stepTitle={currentStepForModal?.title || ''}
      />
      <InventoryOrganizerModal
        open={inventoryModalOpen}
        onClose={() => setInventoryModalOpen(false)}
        onComplete={handleModalComplete}
        stepTitle={currentStepForModal?.title || ''}
      />
      <BrandIdentityModal
        open={brandModalOpen}
        onClose={() => setBrandModalOpen(false)}
        onComplete={handleModalComplete}
        stepTitle={currentStepForModal?.title || ''}
      />
      <SalesStrategyModal
        open={salesModalOpen}
        onClose={() => setSalesModalOpen(false)}
        onComplete={handleModalComplete}
        stepTitle={currentStepForModal?.title || ''}
      />
      <MarketResearchModal
        open={marketModalOpen}
        onClose={() => setMarketModalOpen(false)}
        onComplete={handleModalComplete}
        stepTitle={currentStepForModal?.title || ''}
      />
    </motion.div>
  );
};

// ✅ Exportar con React.memo para evitar re-renders innecesarios
export const ProgressiveMissionCard = React.memo(ProgressiveMissionCardComponent);
