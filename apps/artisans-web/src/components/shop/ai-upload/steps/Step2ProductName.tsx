import React, { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WizardState, getImageUrl } from "../hooks/useWizardState";
import { SaveDraftButton } from "../components/SaveDraftButton";
import { toast } from "sonner";
import {
  getAllCrafts,
  getTechniquesByCraftId,
  type Craft,
  type Technique,
} from "@/services/crafts.actions";
import {
  getApprovedMaterials,
  type Material,
} from "@/services/materials.actions";
import {
  getCuratorialCategories,
  type CuratorialCategory,
} from "@/services/curatorial-categories.actions";

interface Step2ProductNameProps {
  images: (File | string)[];
  name: string;
  craftId?: string;
  primaryTechniqueId?: string;
  secondaryTechniqueId?: string;
  pieceType?: "funcional" | "decorativa" | "mixta";
  style?: "tradicional" | "contemporaneo" | "fusion";
  processType?: "manual" | "mixto" | "asistido";
  estimatedElaborationTime?: string;
  materialIds?: string[];
  curatorialCategory?: string;
  onCraftChange: (craftId: string) => void;
  onPrimaryTechniqueChange: (techniqueId: string) => void;
  onSecondaryTechniqueChange: (techniqueId: string) => void;
  onPieceTypeChange: (pieceType: "funcional" | "decorativa" | "mixta") => void;
  onStyleChange: (style: "tradicional" | "contemporaneo" | "fusion") => void;
  onProcessTypeChange: (processType: "manual" | "mixto" | "asistido") => void;
  onEstimatedElaborationTimeChange: (time: string) => void;
  onMaterialIdsChange: (materialIds: string[]) => void;
  onCuratorialCategoryChange: (category: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  wizardState: WizardState;
  isEditMode?: boolean;
  productIdToEdit?: string;
}

export const Step2ProductName: React.FC<Step2ProductNameProps> = ({
  images,
  name,
  craftId,
  primaryTechniqueId,
  secondaryTechniqueId,
  pieceType,
  style,
  processType,
  estimatedElaborationTime,
  materialIds,
  curatorialCategory,
  onCraftChange,
  onPrimaryTechniqueChange,
  onSecondaryTechniqueChange,
  onPieceTypeChange,
  onStyleChange,
  onProcessTypeChange,
  onEstimatedElaborationTimeChange,
  onMaterialIdsChange,
  onCuratorialCategoryChange,
  onNext,
  onPrevious,
  wizardState,
  isEditMode,
  productIdToEdit,
}) => {
  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [curatorialCategories, setCuratorialCategories] = useState<
    CuratorialCategory[]
  >([]);
  const [loadingCrafts, setLoadingCrafts] = useState(true);
  const [loadingTechniques, setLoadingTechniques] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [loadingCuratorialCategories, setLoadingCuratorialCategories] =
    useState(true);

  // Cargar crafts al montar el componente
  useEffect(() => {
    const fetchCrafts = async () => {
      try {
        const data = await getAllCrafts();
        setCrafts(data);
      } catch (error) {
        console.error("Error loading crafts:", error);
        toast.error("Error al cargar los oficios artesanales");
      } finally {
        setLoadingCrafts(false);
      }
    };

    fetchCrafts();
  }, []);

  // Cargar materiales aprobados al montar el componente
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const data = await getApprovedMaterials();
        setMaterials(data);
      } catch (error) {
        console.error("Error loading materials:", error);
        toast.error("Error al cargar los materiales");
      } finally {
        setLoadingMaterials(false);
      }
    };

    fetchMaterials();
  }, []);

  // Cargar categorías curatoriales al montar el componente
  useEffect(() => {
    const fetchCuratorialCategories = async () => {
      try {
        const data = await getCuratorialCategories();
        setCuratorialCategories(data);
      } catch (error) {
        console.error("Error loading curatorial categories:", error);
        toast.error("Error al cargar las categorías curatoriales");
      } finally {
        setLoadingCuratorialCategories(false);
      }
    };

    fetchCuratorialCategories();
  }, []);

  // Cargar techniques cuando se selecciona un craft
  useEffect(() => {
    if (craftId) {
      const fetchTechniques = async () => {
        setLoadingTechniques(true);
        try {
          const data = await getTechniquesByCraftId(craftId);
          setTechniques(data);

          // Si había una técnica seleccionada pero no está en las nuevas técnicas, limpiarla
          if (
            primaryTechniqueId &&
            !data.find((t) => t.id === primaryTechniqueId)
          ) {
            onPrimaryTechniqueChange("");
          }
          if (
            secondaryTechniqueId &&
            !data.find((t) => t.id === secondaryTechniqueId)
          ) {
            onSecondaryTechniqueChange("");
          }
        } catch (error) {
          console.error("Error loading techniques:", error);
          toast.error("Error al cargar las técnicas");
          setTechniques([]);
        } finally {
          setLoadingTechniques(false);
        }
      };

      fetchTechniques();
    } else {
      setTechniques([]);
    }
  }, [craftId]);

  const handleCraftSelect = (selectedCraftId: string) => {
    // Si se selecciona el mismo craft, deseleccionarlo
    if (craftId === selectedCraftId) {
      onCraftChange("");
      onPrimaryTechniqueChange("");
      onSecondaryTechniqueChange("");
    } else {
      onCraftChange(selectedCraftId);
    }
  };

  const handlePrimaryTechniqueSelect = (techniqueId: string) => {
    // Si se selecciona la misma técnica, deseleccionarla
    if (primaryTechniqueId === techniqueId) {
      onPrimaryTechniqueChange("");
    } else {
      onPrimaryTechniqueChange(techniqueId);

      // Si la técnica seleccionada como primaria era la secundaria, limpiar la secundaria
      if (secondaryTechniqueId === techniqueId) {
        onSecondaryTechniqueChange("");
      }
    }
  };

  const handleSecondaryTechniqueSelect = (techniqueId: string) => {
    // Si se selecciona la misma técnica, deseleccionarla
    if (secondaryTechniqueId === techniqueId) {
      onSecondaryTechniqueChange("");
    } else {
      onSecondaryTechniqueChange(techniqueId);
    }
  };

  const handleMaterialToggle = (materialId: string) => {
    const currentMaterials = materialIds || [];

    if (currentMaterials.includes(materialId)) {
      // Si ya está seleccionado, quitarlo
      onMaterialIdsChange(currentMaterials.filter((id) => id !== materialId));
    } else {
      // Si no está seleccionado, agregarlo
      onMaterialIdsChange([...currentMaterials, materialId]);
    }
  };

  const handleNext = () => {
    if (!craftId) {
      toast.error("Selecciona un oficio artesanal para continuar");
      return;
    }

    if (!primaryTechniqueId) {
      toast.error("Selecciona al menos una técnica principal");
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 italic">
        <h2 className="text-2xl font-bold">Identidad Artesanal</h2>
        <p className="text-muted-foreground">
          El oficio, la tecnica y los materiales que dan vida a tu pieza. Esta
          informacion enriquece el certificado digital.
        </p>
      </div>

      {/* Images Preview */}
      {/* {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {images.length} {images.length === 1 ? 'imagen cargada' : 'imágenes cargadas'}
          </p>
          <div className="flex gap-2 overflow-x-auto py-2">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-border"
              >
                <img
                  src={getImageUrl(image)}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )} */}

      {/* Product Name Display */}
      {name && (
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-left">
            <p className="text-sm text-muted-foreground">Producto:</p>
            <p className="text-lg font-semibold">{name}</p>
          </div>
        </div>
      )}

      {/* Selector de Oficios (Crafts) */}
      <div className="space-y-4 text-left">
        <div className="space-y-2">
          <Label className="block text-left">
            Seleccione el Oficio Artesanal{" "}
            <span className="text-red-500">*</span>
          </Label>

          {loadingCrafts ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                Cargando oficios...
              </span>
            </div>
          ) : crafts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {crafts.map((craft) => (
                <Button
                  key={craft.id}
                  type="button"
                  variant={craftId === craft.id ? "default" : "outline"}
                  onClick={() => handleCraftSelect(craft.id)}
                  className="h-auto py-3 px-4 text-left justify-start"
                >
                  <span className="truncate">{craft.name}</span>
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay oficios disponibles</p>
            </div>
          )}
        </div>
      </div>

      {/* Selector de Técnica Principal */}
      {craftId && (
        <div className="space-y-4 text-left">
          <div className="space-y-2">
            <Label className="block text-left">
              Seleccione la técnica Principal{" "}
              <span className="text-red-500">*</span>
            </Label>

            {loadingTechniques ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Cargando técnicas...
                </span>
              </div>
            ) : techniques.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {techniques.map((technique) => (
                  <Button
                    key={technique.id}
                    type="button"
                    variant={
                      primaryTechniqueId === technique.id
                        ? "default"
                        : "outline"
                    }
                    onClick={() => handlePrimaryTechniqueSelect(technique.id)}
                    className="h-auto py-3 px-4 text-left justify-start"
                    disabled={secondaryTechniqueId === technique.id}
                  >
                    <span className="truncate">{technique.name}</span>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay técnicas disponibles para este oficio</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selector de Técnica Secundaria (Opcional) */}
      {craftId && primaryTechniqueId && techniques.length > 1 && (
        <div className="space-y-4 text-left">
          <div className="space-y-2">
            <Label className="block text-left">
              Seleccione la técnica Secundaria{" "}
              <span className="text-muted-foreground text-xs">(Opcional)</span>
            </Label>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {techniques
                .filter((t) => t.id !== primaryTechniqueId)
                .map((technique) => (
                  <Button
                    key={technique.id}
                    type="button"
                    variant={
                      secondaryTechniqueId === technique.id
                        ? "default"
                        : "outline"
                    }
                    onClick={() => handleSecondaryTechniqueSelect(technique.id)}
                    className="h-auto py-3 px-4 text-left justify-start"
                  >
                    <span className="truncate">{technique.name}</span>
                  </Button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Selector de Tipo de Pieza */}
      <div className="space-y-4 text-left">
        <div className="space-y-2">
          <Label className="block text-left">Seleccione el tipo de Pieza</Label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              type="button"
              variant={pieceType === "funcional" ? "default" : "outline"}
              onClick={() => onPieceTypeChange("funcional")}
              className="h-auto py-4 px-4 flex flex-col items-start justify-start text-left"
            >
              <span className="font-semibold text-base">FUNCIONAL</span>
              <span className="text-xs text-muted-foreground mt-1">
                Tiene un uso práctico
              </span>
            </Button>

            <Button
              type="button"
              variant={pieceType === "decorativa" ? "default" : "outline"}
              onClick={() => onPieceTypeChange("decorativa")}
              className="h-auto py-4 px-4 flex flex-col items-start justify-start text-left"
            >
              <span className="font-semibold text-base">DECORATIVA</span>
              <span className="text-xs text-muted-foreground mt-1">
                Principalmente estética
              </span>
            </Button>

            <Button
              type="button"
              variant={pieceType === "mixta" ? "default" : "outline"}
              onClick={() => onPieceTypeChange("mixta")}
              className="h-auto py-4 px-4 flex flex-col items-start justify-start text-left"
            >
              <span className="font-semibold text-base">MIXTA</span>
              <span className="text-xs text-muted-foreground mt-1">
                Combina uso y decoración
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Selector de Estilo */}
      <div className="space-y-4 text-left">
        <div className="space-y-2">
          <Label className="block text-left">
            Seleccione el estilo de Pieza
          </Label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              type="button"
              variant={style === "tradicional" ? "default" : "outline"}
              onClick={() => onStyleChange("tradicional")}
              className="h-auto py-3 px-4 text-left justify-start"
            >
              <span className="font-semibold text-base">TRADICIONAL</span>
            </Button>

            <Button
              type="button"
              variant={style === "contemporaneo" ? "default" : "outline"}
              onClick={() => onStyleChange("contemporaneo")}
              className="h-auto py-3 px-4 text-left justify-start"
            >
              <span className="font-semibold text-base">CONTEMPORÁNEO</span>
            </Button>

            <Button
              type="button"
              variant={style === "fusion" ? "default" : "outline"}
              onClick={() => onStyleChange("fusion")}
              className="h-auto py-3 px-4 text-left justify-start"
            >
              <span className="font-semibold text-base">FUSIÓN</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Selector de Proceso de Elaboración */}
      <div className="space-y-4 text-left">
        <div className="space-y-2">
          <Label className="block text-left">
            Seleccione el proceso de elaboración
          </Label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              type="button"
              variant={processType === "manual" ? "default" : "outline"}
              onClick={() => onProcessTypeChange("manual")}
              className="h-auto py-4 px-4 flex flex-col items-start justify-start text-left"
            >
              <span className="font-semibold text-base">100% MANUAL</span>
              <span className="text-xs text-muted-foreground mt-1">
                Hecho en las manos, a mano
              </span>
            </Button>

            <Button
              type="button"
              variant={processType === "mixto" ? "default" : "outline"}
              onClick={() => onProcessTypeChange("mixto")}
              className="h-auto py-4 px-4 flex flex-col items-start justify-start text-left"
            >
              <span className="font-semibold text-base">MIXTO</span>
              <span className="text-xs text-muted-foreground mt-1">
                Combina técnicas manuales y herramientas
              </span>
            </Button>

            <Button
              type="button"
              variant={processType === "asistido" ? "default" : "outline"}
              onClick={() => onProcessTypeChange("asistido")}
              className="h-auto py-4 px-4 flex flex-col items-start justify-start text-left"
            >
              <span className="font-semibold text-base">ASISTIDO</span>
              <span className="text-xs text-muted-foreground mt-1">
                Con apoyo de máquinas o artesanos
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tiempo Estimado de Elaboración */}
      <div className="space-y-4 text-left">
        <div className="space-y-2">
          <Label htmlFor="estimatedElaborationTime" className="block text-left">
            Tiempo estimado de elaboración
          </Label>
          <Input
            id="estimatedElaborationTime"
            type="text"
            value={estimatedElaborationTime || ""}
            onChange={(e) => {
              const value = e.target.value;
              // Solo permitir números
              if (value === "" || /^\d+$/.test(value)) {
                onEstimatedElaborationTimeChange(value);
              }
            }}
            placeholder="Ej: 5 (días)"
            className="text-left"
          />
          <p className="text-xs text-muted-foreground text-left">
            Ingresa solo números (ejemplo: 5 para 5 días)
          </p>
        </div>
      </div>

      {/* Selector de Materiales (Múltiple) */}
      <div className="space-y-4 text-left">
        <div className="space-y-2">
          <Label className="block text-left">
            Seleccione los materiales utilizados
          </Label>

          {loadingMaterials ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                Cargando materiales...
              </span>
            </div>
          ) : materials.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {materials.map((material) => {
                const isSelected = materialIds?.includes(material.id) || false;

                return (
                  <Button
                    key={material.id}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handleMaterialToggle(material.id)}
                    className="h-auto py-3 px-4 text-left justify-start"
                  >
                    <span className="truncate">{material.name}</span>
                  </Button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay materiales disponibles</p>
            </div>
          )}

          {materialIds && materialIds.length > 0 && (
            <p className="text-xs text-muted-foreground text-left">
              {materialIds.length} material(es) seleccionado(s)
            </p>
          )}
        </div>
      </div>

      {/* Selector de Categoría Curatorial */}
      <div className="space-y-4 text-left">
        <div className="space-y-2">
          <Label className="block text-left">Categoría Curatorial</Label>

          {loadingCuratorialCategories ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                Cargando categorías curatoriales...
              </span>
            </div>
          ) : curatorialCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {curatorialCategories.map((category) => (
                <Button
                  key={category.id}
                  type="button"
                  variant={
                    curatorialCategory === category.id ? "default" : "outline"
                  }
                  onClick={() => onCuratorialCategoryChange(category.id)}
                  className="h-auto py-4 px-4 flex flex-col items-start justify-start text-left"
                >
                  <span className="font-semibold text-base uppercase">
                    {category.name}
                  </span>
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay categorías curatoriales disponibles</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between gap-2">
        <Button
          variant="outline"
          onClick={onPrevious}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>

        <div className="flex gap-2">
          {(!isEditMode || wizardState.status === 'draft') && (
            <SaveDraftButton wizardState={wizardState} productId={productIdToEdit} variant="outline" />
          )}

          <Button
            onClick={handleNext}
            disabled={!craftId || !primaryTechniqueId}
            className="flex items-center gap-2"
          >
            Continuar
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
