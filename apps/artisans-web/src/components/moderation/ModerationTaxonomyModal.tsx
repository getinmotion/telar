import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
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

interface TaxonomyData {
  craftId?: string;
  primaryTechniqueId?: string;
  secondaryTechniqueId?: string;
  pieceType?: "funcional" | "decorativa" | "mixta";
  style?: "tradicional" | "contemporaneo" | "fusion";
  processType?: "manual" | "mixto" | "asistido";
  estimatedElaborationTime?: string;
  materialIds?: string[];
  curatorialCategory?: string;
}

interface ModerationTaxonomyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: TaxonomyData;
  onSave: (data: TaxonomyData) => void;
}

export const ModerationTaxonomyModal: React.FC<
  ModerationTaxonomyModalProps
> = ({ open, onOpenChange, initialData, onSave }) => {
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

  // Estados locales para edición
  const [localData, setLocalData] = useState<TaxonomyData>(initialData);

  // Sincronizar con initialData cuando cambia
  useEffect(() => {
    setLocalData(initialData);
  }, [initialData]);

  // Cargar crafts
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

  // Cargar materiales
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

  // Cargar categorías curatoriales
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

  // Cargar técnicas cuando cambia el craft
  useEffect(() => {
    if (localData.craftId) {
      const fetchTechniques = async () => {
        setLoadingTechniques(true);
        try {
          const data = await getTechniquesByCraftId(localData.craftId!);
          setTechniques(data);

          // Limpiar técnicas si no están en la nueva lista
          if (
            localData.primaryTechniqueId &&
            !data.find((t) => t.id === localData.primaryTechniqueId)
          ) {
            setLocalData((prev) => ({ ...prev, primaryTechniqueId: undefined }));
          }
          if (
            localData.secondaryTechniqueId &&
            !data.find((t) => t.id === localData.secondaryTechniqueId)
          ) {
            setLocalData((prev) => ({
              ...prev,
              secondaryTechniqueId: undefined,
            }));
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
  }, [localData.craftId]);

  const handleCraftSelect = (craftId: string) => {
    if (localData.craftId === craftId) {
      setLocalData((prev) => ({
        ...prev,
        craftId: undefined,
        primaryTechniqueId: undefined,
        secondaryTechniqueId: undefined,
      }));
    } else {
      setLocalData((prev) => ({ ...prev, craftId }));
    }
  };

  const handlePrimaryTechniqueSelect = (techniqueId: string) => {
    if (localData.primaryTechniqueId === techniqueId) {
      setLocalData((prev) => ({ ...prev, primaryTechniqueId: undefined }));
    } else {
      setLocalData((prev) => ({
        ...prev,
        primaryTechniqueId: techniqueId,
        // Si la técnica primaria era la secundaria, limpiar secundaria
        secondaryTechniqueId:
          prev.secondaryTechniqueId === techniqueId
            ? undefined
            : prev.secondaryTechniqueId,
      }));
    }
  };

  const handleSecondaryTechniqueSelect = (techniqueId: string) => {
    if (localData.secondaryTechniqueId === techniqueId) {
      setLocalData((prev) => ({ ...prev, secondaryTechniqueId: undefined }));
    } else {
      setLocalData((prev) => ({ ...prev, secondaryTechniqueId: techniqueId }));
    }
  };

  const handleMaterialToggle = (materialId: string) => {
    const currentMaterials = localData.materialIds || [];

    if (currentMaterials.includes(materialId)) {
      setLocalData((prev) => ({
        ...prev,
        materialIds: currentMaterials.filter((id) => id !== materialId),
      }));
    } else {
      setLocalData((prev) => ({
        ...prev,
        materialIds: [...currentMaterials, materialId],
      }));
    }
  };

  const handleSave = () => {
    onSave(localData);
    onOpenChange(false);
    toast.success("Taxonomías actualizadas");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Editar Taxonomías</DialogTitle>
          <DialogDescription>
            Gestiona la identidad artesanal del producto
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-180px)] px-6">
          <div className="space-y-6 pb-4">
            {/* Selector de Oficios */}
            <div className="space-y-4">
              <Label className="block text-left font-semibold">
                Oficio Artesanal
              </Label>

              {loadingCrafts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Cargando oficios...
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {crafts.map((craft) => (
                    <Button
                      key={craft.id}
                      type="button"
                      size="sm"
                      variant={
                        localData.craftId === craft.id ? "default" : "outline"
                      }
                      onClick={() => handleCraftSelect(craft.id)}
                      className="h-auto py-2 px-3 text-left justify-start text-xs"
                    >
                      <span className="truncate">{craft.name}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Técnica Principal */}
            {localData.craftId && (
              <div className="space-y-4">
                <Label className="block text-left font-semibold">
                  Técnica Principal
                </Label>

                {loadingTechniques ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Cargando técnicas...
                    </span>
                  </div>
                ) : techniques.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {techniques.map((technique) => (
                      <Button
                        key={technique.id}
                        type="button"
                        size="sm"
                        variant={
                          localData.primaryTechniqueId === technique.id
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          handlePrimaryTechniqueSelect(technique.id)
                        }
                        disabled={localData.secondaryTechniqueId === technique.id}
                        className="h-auto py-2 px-3 text-left justify-start text-xs"
                      >
                        <span className="truncate">{technique.name}</span>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No hay técnicas disponibles
                  </p>
                )}
              </div>
            )}

            {/* Técnica Secundaria */}
            {localData.craftId &&
              localData.primaryTechniqueId &&
              techniques.length > 1 && (
                <div className="space-y-4">
                  <Label className="block text-left font-semibold">
                    Técnica Secundaria{" "}
                    <span className="text-muted-foreground text-xs font-normal">
                      (Opcional)
                    </span>
                  </Label>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {techniques
                      .filter((t) => t.id !== localData.primaryTechniqueId)
                      .map((technique) => (
                        <Button
                          key={technique.id}
                          type="button"
                          size="sm"
                          variant={
                            localData.secondaryTechniqueId === technique.id
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            handleSecondaryTechniqueSelect(technique.id)
                          }
                          className="h-auto py-2 px-3 text-left justify-start text-xs"
                        >
                          <span className="truncate">{technique.name}</span>
                        </Button>
                      ))}
                  </div>
                </div>
              )}

            {/* Tipo de Pieza */}
            <div className="space-y-4">
              <Label className="block text-left font-semibold">
                Tipo de Pieza
              </Label>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={
                    localData.pieceType === "funcional" ? "default" : "outline"
                  }
                  onClick={() =>
                    setLocalData((prev) => ({ ...prev, pieceType: "funcional" }))
                  }
                  className="h-auto py-3 px-3 flex flex-col items-start text-xs"
                >
                  <span className="font-semibold">FUNCIONAL</span>
                  <span className="text-[10px] text-muted-foreground">
                    Uso práctico
                  </span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant={
                    localData.pieceType === "decorativa" ? "default" : "outline"
                  }
                  onClick={() =>
                    setLocalData((prev) => ({
                      ...prev,
                      pieceType: "decorativa",
                    }))
                  }
                  className="h-auto py-3 px-3 flex flex-col items-start text-xs"
                >
                  <span className="font-semibold">DECORATIVA</span>
                  <span className="text-[10px] text-muted-foreground">
                    Estética
                  </span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant={
                    localData.pieceType === "mixta" ? "default" : "outline"
                  }
                  onClick={() =>
                    setLocalData((prev) => ({ ...prev, pieceType: "mixta" }))
                  }
                  className="h-auto py-3 px-3 flex flex-col items-start text-xs"
                >
                  <span className="font-semibold">MIXTA</span>
                  <span className="text-[10px] text-muted-foreground">
                    Combinado
                  </span>
                </Button>
              </div>
            </div>

            {/* Estilo */}
            <div className="space-y-4">
              <Label className="block text-left font-semibold">Estilo</Label>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={
                    localData.style === "tradicional" ? "default" : "outline"
                  }
                  onClick={() =>
                    setLocalData((prev) => ({ ...prev, style: "tradicional" }))
                  }
                  className="h-auto py-2 px-3 text-xs"
                >
                  TRADICIONAL
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant={
                    localData.style === "contemporaneo" ? "default" : "outline"
                  }
                  onClick={() =>
                    setLocalData((prev) => ({ ...prev, style: "contemporaneo" }))
                  }
                  className="h-auto py-2 px-3 text-xs"
                >
                  CONTEMPORÁNEO
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant={localData.style === "fusion" ? "default" : "outline"}
                  onClick={() =>
                    setLocalData((prev) => ({ ...prev, style: "fusion" }))
                  }
                  className="h-auto py-2 px-3 text-xs"
                >
                  FUSIÓN
                </Button>
              </div>
            </div>

            {/* Proceso de Elaboración */}
            <div className="space-y-4">
              <Label className="block text-left font-semibold">
                Proceso de Elaboración
              </Label>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={
                    localData.processType === "manual" ? "default" : "outline"
                  }
                  onClick={() =>
                    setLocalData((prev) => ({ ...prev, processType: "manual" }))
                  }
                  className="h-auto py-3 px-3 flex flex-col items-start text-xs"
                >
                  <span className="font-semibold">100% MANUAL</span>
                  <span className="text-[10px] text-muted-foreground">
                    A mano
                  </span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant={
                    localData.processType === "mixto" ? "default" : "outline"
                  }
                  onClick={() =>
                    setLocalData((prev) => ({ ...prev, processType: "mixto" }))
                  }
                  className="h-auto py-3 px-3 flex flex-col items-start text-xs"
                >
                  <span className="font-semibold">MIXTO</span>
                  <span className="text-[10px] text-muted-foreground">
                    Manual + herramientas
                  </span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant={
                    localData.processType === "asistido" ? "default" : "outline"
                  }
                  onClick={() =>
                    setLocalData((prev) => ({ ...prev, processType: "asistido" }))
                  }
                  className="h-auto py-3 px-3 flex flex-col items-start text-xs"
                >
                  <span className="font-semibold">ASISTIDO</span>
                  <span className="text-[10px] text-muted-foreground">
                    Máquinas
                  </span>
                </Button>
              </div>
            </div>

            {/* Tiempo Estimado */}
            <div className="space-y-2">
              <Label htmlFor="estimatedTime" className="font-semibold">
                Tiempo Estimado de Elaboración (días)
              </Label>
              <Input
                id="estimatedTime"
                type="text"
                value={localData.estimatedElaborationTime || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || /^\d+$/.test(value)) {
                    setLocalData((prev) => ({
                      ...prev,
                      estimatedElaborationTime: value,
                    }));
                  }
                }}
                placeholder="Ej: 5"
                className="max-w-xs"
              />
            </div>

            {/* Materiales */}
            <div className="space-y-4">
              <Label className="block text-left font-semibold">
                Materiales Utilizados
              </Label>

              {loadingMaterials ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Cargando materiales...
                  </span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {materials.map((material) => {
                      const isSelected =
                        localData.materialIds?.includes(material.id) || false;

                      return (
                        <Button
                          key={material.id}
                          type="button"
                          size="sm"
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => handleMaterialToggle(material.id)}
                          className="h-auto py-2 px-3 text-left justify-start text-xs"
                        >
                          <span className="truncate">{material.name}</span>
                        </Button>
                      );
                    })}
                  </div>
                  {localData.materialIds && localData.materialIds.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {localData.materialIds.length} material(es) seleccionado(s)
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Categoría Curatorial */}
            <div className="space-y-4">
              <Label className="block text-left font-semibold">
                Categoría Curatorial
              </Label>

              {loadingCuratorialCategories ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Cargando categorías...
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {curatorialCategories.map((category) => (
                    <Button
                      key={category.id}
                      type="button"
                      size="sm"
                      variant={
                        localData.curatorialCategory === category.id
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        setLocalData((prev) => ({
                          ...prev,
                          curatorialCategory: category.id,
                        }))
                      }
                      className="h-auto py-3 px-3 text-left justify-start text-xs"
                    >
                      <span className="font-semibold uppercase">
                        {category.name}
                      </span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 pb-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancelar
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
