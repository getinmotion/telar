import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Loader2,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useArtisanShop } from "@/hooks/useArtisanShop";
import { useAuth } from "@/context/AuthContext";
import { updateArtisanShop } from "@/services/artisanShops.actions";
import { generateArtisanProfileHistory } from "@/services/ai.actions";
import {
  ArtisanProfileData,
  DEFAULT_ARTISAN_PROFILE,
} from "@/types/artisanProfile";
import { Step1Identity } from "./artisan-profile/Step1Identity";
import { Step2Origin } from "./artisan-profile/Step2Origin";
import { Step3CulturalHistory } from "./artisan-profile/Step3CulturalHistory";
import { Step4Workshop } from "./artisan-profile/Step4Workshop";
import { Step5Craft } from "./artisan-profile/Step5Craft";
import { Step6HumanGallery } from "./artisan-profile/Step6HumanGallery";
import { Step7Preview } from "./artisan-profile/Step7Preview";
import { ArtisanProfileDashboard } from "./artisan-profile/ArtisanProfileDashboard";
import { EventBus } from "@/utils/eventBus";
import { NotificationTemplates } from "@/services/notificationService";

const STEPS = [
  { id: 1, title: "Identidad", icon: "👤" },
  { id: 2, title: "Origen", icon: "❤️" },
  { id: 3, title: "Cultura", icon: "🌍" },
  { id: 4, title: "Taller", icon: "🏠" },
  { id: 5, title: "Artesanía", icon: "✨" },
  { id: 6, title: "Galería", icon: "📷" },
  { id: 7, title: "Publicar", icon: "🚀" },
];

interface ArtisanProfileWizardProps {
  onComplete?: () => void;
}

export const ArtisanProfileWizard: React.FC<ArtisanProfileWizardProps> = ({
  onComplete,
}) => {
  const { shop, forceRefresh } = useArtisanShop();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<ArtisanProfileData>(DEFAULT_ARTISAN_PROFILE);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<any>(null);
  const [editSection, setEditSection] = useState<string | null>(null);

  // Check if profile is already completed
  const shopAny = shop as any;
  const isProfileCompleted = shopAny?.artisanProfileCompleted === true;

  // Load existing profile data
  useEffect(() => {
    if (shopAny?.artisanProfile) {
      const profile = shopAny.artisanProfile as ArtisanProfileData;
      setData({ ...DEFAULT_ARTISAN_PROFILE, ...profile });
      if (profile.generatedStory) {
        setGeneratedStory(profile.generatedStory);
      }
    }
  }, [shopAny?.artisanProfile]);

  // Handle edit section from dashboard
  const handleEditSection = (section: string) => {
    setEditSection(section);
    // Map section to step
    const sectionToStep: Record<string, number> = {
      identity: 1,
      origin: 2,
      cultural: 3,
      workshop: 4,
      craft: 5,
      gallery: 6,
    };
    setCurrentStep(sectionToStep[section] || 1);
  };

  const updateData = (updates: Partial<ArtisanProfileData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!data.artisanName && !!data.artisticName;
      case 2:
        return (
          !!data.learnedFrom &&
          data.startAge > 0 &&
          !!data.culturalMeaning &&
          !!data.motivation
        );
      case 3:
        return (
          !!data.culturalHistory &&
          !!data.ethnicRelation &&
          !!data.territorialImportance
        );
      case 4:
        return data.workshopPhotos.length >= 1 && !!data.workshopDescription;
      case 5:
        return (
          data.techniques.length > 0 &&
          data.materials.length > 0 &&
          !!data.averageTime &&
          !!data.uniqueness &&
          !!data.craftMessage
        );
      case 6:
        return data.workingPhotos.length >= 1;
      default:
        return true;
    }
  };

  // ✅ MIGRATED: Save draft using NestJS backend
  // Endpoint: PATCH /artisan-shops/:id
  const saveDraft = async () => {
    if (!shop?.id) return;

    setIsSaving(true);
    try {
      await updateArtisanShop(shop.id, {
        artisanProfile: data as any,
        artisanProfileCompleted: isProfileCompleted, // Keep completed status if editing
      });

      toast({
        title: editSection ? "Cambios guardados" : "Borrador guardado",
        description: editSection
          ? "Tu sección ha sido actualizada"
          : "Tu progreso ha sido guardado",
      });

      if (editSection) {
        setEditSection(null);
        forceRefresh();
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ MIGRATED: Generate artisan profile story using NestJS backend
  // Endpoint: POST /ai/generate-artisan-profile-history
  const generateStory = async () => {
    if (!shop?.id) return;

    setIsGenerating(true);
    try {
      const storyData = await generateArtisanProfileHistory({
        profile: data,
        shopName: shop.shopName,
        craftType: shop.craftType || "",
        region: shop.region || "",
      });

      setGeneratedStory(storyData);
      return storyData;
    } catch (error) {
      console.error("Error generating story:", error);
      toast({
        title: "Error",
        description: "No se pudo generar la historia. Continuando sin ella.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // ✅ MIGRATED: Publish profile using NestJS backend
  // Endpoint: PATCH /artisan-shops/:id
  const handlePublish = async () => {
    if (!shop?.id) return;

    setIsSaving(true);
    try {
      let story = generatedStory;
      if (!story) {
        story = await generateStory();
      }

      const finalProfile: ArtisanProfileData = {
        ...data,
        completedAt: new Date().toISOString(),
        generatedStory: story,
      };

      await updateArtisanShop(shop.id, {
        artisanProfile: finalProfile as any,
        artisanProfileCompleted: true,
      });

      EventBus.publish("artisan.profile.completed", { shopId: shop.id });

      if (user) {
        await NotificationTemplates.artisanProfileCompleted(
          user.id,
          shop.shopName,
          shop.shopSlug,
        );
      }

      toast({
        title: "¡Perfil Artesanal publicado!",
        description: "Tu historia ahora es visible en tu tienda",
      });

      forceRefresh();
      onComplete?.();
    } catch (error) {
      console.error("Error publishing profile:", error);
      toast({
        title: "Error",
        description: "No se pudo publicar el perfil",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    await saveDraft();

    if (currentStep === 6) {
      await generateStory();
    }

    setCurrentStep((prev) => Math.min(prev + 1, 7));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // If editing a section, show just that step with save button
  if (editSection) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 1 && (
                <Step1Identity data={data} onChange={updateData} />
              )}
              {currentStep === 2 && (
                <Step2Origin data={data} onChange={updateData} />
              )}
              {currentStep === 3 && (
                <Step3CulturalHistory data={data} onChange={updateData} />
              )}
              {currentStep === 4 && (
                <Step4Workshop data={data} onChange={updateData} />
              )}
              {currentStep === 5 && (
                <Step5Craft data={data} onChange={updateData} />
              )}
              {currentStep === 6 && (
                <Step6HumanGallery data={data} onChange={updateData} />
              )}
            </motion.div>
          </AnimatePresence>
        </Card>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => setEditSection(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={saveDraft} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Guardar Cambios
          </Button>
        </div>
      </div>
    );
  }

  // If profile is completed, show dashboard
  if (isProfileCompleted && !editSection) {
    return (
      <ArtisanProfileDashboard
        data={data}
        shopId={shop?.id || ""}
        shopSlug={shop?.shopSlug || ""}
        shopName={shop?.shopName || ""}
        craftType={shop?.craftType || ""}
        region={shop?.region || ""}
        onEdit={handleEditSection}
        onRefresh={forceRefresh}
      />
    );
  }

  const progress = (currentStep / 7) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Identity data={data} onChange={updateData} />;
      case 2:
        return <Step2Origin data={data} onChange={updateData} />;
      case 3:
        return <Step3CulturalHistory data={data} onChange={updateData} />;
      case 4:
        return <Step4Workshop data={data} onChange={updateData} />;
      case 5:
        return <Step5Craft data={data} onChange={updateData} />;
      case 6:
        return <Step6HumanGallery data={data} onChange={updateData} />;
      case 7:
        return (
          <Step7Preview
            data={data}
            generatedStory={generatedStory}
            isGenerating={isGenerating}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Modern Progress Stepper */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <motion.button
                onClick={() =>
                  step.id <= currentStep && setCurrentStep(step.id)
                }
                className={`
                  relative flex flex-col items-center cursor-pointer
                  ${step.id <= currentStep ? "text-primary" : "text-muted-foreground"}
                `}
                whileHover={{ scale: step.id <= currentStep ? 1.05 : 1 }}
                whileTap={{ scale: step.id <= currentStep ? 0.95 : 1 }}
              >
                <div
                  className={`
                  w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-1 transition-all
                  ${
                    step.id === currentStep
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : step.id < currentStep
                        ? "bg-success text-success-foreground"
                        : "bg-muted"
                  }
                `}
                >
                  {step.id < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span className="text-xs hidden sm:block font-medium">
                  {step.title}
                </span>
              </motion.button>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 rounded ${step.id < currentStep ? "bg-success" : "bg-muted"}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Step Content */}
      <Card className="p-6 md:p-8 shadow-lg border-border/50">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1 || isSaving}
          className="h-11"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        <div className="flex gap-2">
          {currentStep < 7 && (
            <Button
              variant="ghost"
              onClick={saveDraft}
              disabled={isSaving}
              className="h-11"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              <span className="hidden sm:inline">Guardar borrador</span>
            </Button>
          )}

          {currentStep < 7 ? (
            <Button
              onClick={handleNext}
              disabled={isSaving || isGenerating}
              className="h-11"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                  Generando...
                </>
              ) : (
                <>
                  Siguiente
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handlePublish}
              disabled={isSaving || isGenerating}
              className="h-11 bg-success hover:bg-success/90 text-success-foreground"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Publicar Perfil Artesanal
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
