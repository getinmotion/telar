import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Steps } from "@/components/ui/steps";
import { Step1ImageUpload } from "./steps/Step1ImageUpload";
import { Step2ProductName } from "./steps/Step2ProductName";
import { Step3Description } from "./steps/Step3Description";
import { Step4PriceCategory } from "./steps/Step4PriceCategory";
import { Step5Review } from "./steps/Step5Review";
import { useWizardState } from "./hooks/useWizardState";
import { ArrowLeft, Store, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getArtisanShopByUserId } from "@/services/artisanShops.actions";
import {
  getProductNewById,
  mapProductResponseToWizardState,
} from "@/services/products-new.actions";

const STEPS = [
  { title: "La pieza", description: "Sube las fotos de tu producto" },
  {
    title: "Artesanía",
    description: "Esta informacion enriquece el certificado digital",
  },
  { title: "Precio", description: "Configura precio e inventario" },
  { title: "Revisar", description: "Revisa y publica tu producto" },
];

export const AIProductUploadWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasShop, setHasShop] = useState<boolean | null>(null);
  const [isCheckingShop, setIsCheckingShop] = useState(true);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  const { user } = useAuth();

  // Check URL params for edit mode
  const urlParams = new URLSearchParams(window.location.search);
  const isEditMode = urlParams.get("edit") === "true";
  const productIdToEdit = urlParams.get("productId");

  // Check if we should continue from a draft (only restore state if ?continue=true)
  const shouldContinue = urlParams.get("continue") === "true";
  const { wizardState, updateWizardState, resetWizard } =
    useWizardState(shouldContinue);

  // Verifica si el usuario tiene tienda usando el backend NestJS
  useEffect(() => {
    if (!user) return;

    const checkUserShop = async () => {
      try {
        const shop = await getArtisanShopByUserId(user.id);
        setHasShop(!!shop?.id);
      } catch {
        // Si el endpoint lanza 404 significa que no tiene tienda
        setHasShop(false);
      } finally {
        setIsCheckingShop(false);
      }
    };

    checkUserShop();
  }, [user]);

  // Cargar datos del producto si estamos en modo edición
  useEffect(() => {
    if (!isEditMode || !productIdToEdit) return;

    const loadProductData = async () => {
      setIsLoadingProduct(true);
      try {
        const product = await getProductNewById(productIdToEdit);

        if (product) {
          const mappedState = mapProductResponseToWizardState(product);

          updateWizardState(mappedState);
        } else {
          toast.error("Producto no encontrado");
          // Redirigir a crear nuevo producto
          setTimeout(() => {
            window.location.href = "/productos/subir";
          }, 2000);
        }
      } catch (error) {
        console.error("❌ Error completo al cargar producto:", error);
        console.error(
          "❌ Error stack:",
          error instanceof Error ? error.stack : "No stack",
        );
        console.error(
          "❌ Error message:",
          error instanceof Error ? error.message : String(error),
        );

        setTimeout(() => {
          window.location.href = "/productos/subir";
        }, 2000);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    loadProductData();
  }, [isEditMode, productIdToEdit]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Solo permitir navegar a pasos completados o el siguiente
    if (stepIndex <= currentStep + 1) {
      setCurrentStep(stepIndex);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step1ImageUpload
            images={wizardState.images}
            name={wizardState.name}
            productName={wizardState.name}
            shortDescription={wizardState.shortDescription || ""}
            history={wizardState.history || ""}
            categoryId={wizardState.category}
            onImagesChange={(images) => updateWizardState({ images })}
            onProductNameChange={(name) => updateWizardState({ name })}
            onShortDescriptionChange={(shortDescription) =>
              updateWizardState({ shortDescription })
            }
            onHistoryChange={(history) => updateWizardState({ history })}
            onCategoryChange={(category) => updateWizardState({ category })}
            onNext={handleNext}
            wizardState={wizardState}
            isEditMode={isEditMode}
            productIdToEdit={productIdToEdit || undefined}
          />
        );
      case 1:
        return (
          <Step2ProductName
            images={wizardState.images}
            name={wizardState.name}
            craftId={wizardState.craftId}
            primaryTechniqueId={wizardState.primaryTechniqueId}
            secondaryTechniqueId={wizardState.secondaryTechniqueId}
            pieceType={wizardState.pieceType}
            style={wizardState.style}
            processType={wizardState.processType}
            estimatedElaborationTime={wizardState.estimatedElaborationTime}
            materialIds={wizardState.materials}
            onCraftChange={(craftId) => updateWizardState({ craftId })}
            onPrimaryTechniqueChange={(primaryTechniqueId) =>
              updateWizardState({ primaryTechniqueId })
            }
            onSecondaryTechniqueChange={(secondaryTechniqueId) =>
              updateWizardState({ secondaryTechniqueId })
            }
            onPieceTypeChange={(pieceType) => updateWizardState({ pieceType })}
            onStyleChange={(style) => updateWizardState({ style })}
            onProcessTypeChange={(processType) =>
              updateWizardState({ processType })
            }
            onEstimatedElaborationTimeChange={(estimatedElaborationTime) =>
              updateWizardState({ estimatedElaborationTime })
            }
            onMaterialIdsChange={(materials) =>
              updateWizardState({ materials })
            }
            onNext={handleNext}
            onPrevious={handlePrevious}
            wizardState={wizardState}
            isEditMode={isEditMode}
            productIdToEdit={productIdToEdit || undefined}
          />
        );
      case 2:
        return (
          <Step4PriceCategory
            name={wizardState.name}
            description={wizardState.description}
            price={wizardState.price}
            availabilityType={wizardState.availabilityType}
            sku={wizardState.sku}
            inventory={wizardState.inventory}
            weight={wizardState.weight}
            dimensions={wizardState.dimensions}
            customizable={wizardState.customizable}
            madeToOrder={wizardState.madeToOrder}
            leadTimeDays={wizardState.leadTimeDays}
            productionTimeHours={wizardState.productionTimeHours}
            allowsLocalPickup={wizardState.allowsLocalPickup}
            hasVariants={wizardState.hasVariants}
            variantOptions={wizardState.variantOptions}
            variants={wizardState.variants}
            onDataChange={(data) => updateWizardState(data)}
            onNext={handleNext}
            onPrevious={handlePrevious}
            wizardState={wizardState}
            isEditMode={isEditMode}
            productIdToEdit={productIdToEdit || undefined}
          />
        );
      case 3:
        return (
          <Step5Review
            wizardState={wizardState}
            onEdit={(step) => setCurrentStep(step)}
            onPublish={() => {
              // Reset wizard after successful publish
              resetWizard();
              setCurrentStep(0);
            }}
            onPrevious={handlePrevious}
            isEditMode={isEditMode}
            productIdToEdit={productIdToEdit || undefined}
          />
        );
      default:
        return null;
    }
  };

  // Show loading while checking shop
  if (isCheckingShop) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Verificando tu tienda...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show shop requirement if user doesn't have a shop
  if (hasShop === false) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center space-y-6">
          <div className="space-y-4">
            <Store className="w-16 h-16 mx-auto text-primary" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">
                ¡Necesitas crear tu tienda primero!
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Para poder subir productos, primero debes crear tu tienda
                artesanal. Es rápido y fácil con nuestro asistente inteligente.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              size="lg"
              onClick={() => (window.location.href = "/crear-tienda")}
              className="w-full max-w-sm"
            >
              <Store className="w-4 h-4 mr-2" />
              Crear mi tienda ahora
            </Button>

            <p className="text-sm text-muted-foreground">
              Una vez creada tu tienda, podrás regresar aquí para subir tus
              productos
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          {isEditMode ? "Editar producto" : "Creador de producto"}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode
            ? "Actualiza la información de tu producto"
            : "Te ayudamos paso a paso a crear el producto perfecto para tu tienda"}
        </p>
      </div>

      {/* Progress Steps */}
      <Steps steps={STEPS} currentStep={currentStep} />

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="min-h-[400px]"
      >
        {renderStepContent()}
      </motion.div>
    </div>
  );
};
