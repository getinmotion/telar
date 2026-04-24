import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModerationHistory } from "./ModerationHistory";
import { ModerationStatusBadge } from "./ModerationStatusBadge";
import { ModerationTaxonomyModal } from "./ModerationTaxonomyModal";
import { ModerationImageViewer } from "./ModerationImageViewer";
import {
  RotateCcw,
  CheckCircle,
  Edit,
  AlertCircle,
  XCircle,
  Package,
  History,
  Loader2,
  Truck,
  Tags,
} from "lucide-react";
import { PriceInput } from "@/components/ui/PriceInput";
import { WeightInput } from "@/components/ui/WeightInput";
import { formatCurrency } from "@/utils/currency";
import type {
  ModerationProduct,
  ModerationHistory as ModerationHistoryType,
} from "@/hooks/useProductModeration";

interface ProductDimensions {
  length: number | null;
  width: number | null;
  height: number | null;
}

interface ProductEdits {
  name: string;
  shortDescription: string;
  history: string;
  price: number;
  inventory: number;
  weight: number | null;
  dimensions: ProductDimensions | null;
  images: string[];
  // Taxonomías
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

interface ModerationProductEditorProps {
  product: ModerationProduct;
  history: ModerationHistoryType[];
  onModerate: (
    action: "approve" | "approve_with_edits" | "request_changes" | "reject",
    comment?: string,
    edits?: Record<string, any>,
  ) => Promise<void>;
  onShopApprovalChange: (
    shopId: string,
    approved: boolean,
    comment?: string,
  ) => Promise<void>;
  moderating: boolean;
}

export const ModerationProductEditor: React.FC<
  ModerationProductEditorProps
> = ({ product, history, onModerate, onShopApprovalChange, moderating }) => {
  const [activeTab, setActiveTab] = useState("product");
  const [comment, setComment] = useState("");
  const [taxonomyModalOpen, setTaxonomyModalOpen] = useState(false);
  const [edits, setEdits] = useState<ProductEdits>({
    name: "",
    shortDescription: "",
    history: "",
    price: 0,
    inventory: 0,
    weight: null,
    dimensions: null,
    images: [],
    // Taxonomías iniciales vacías
    craftId: undefined,
    primaryTechniqueId: undefined,
    secondaryTechniqueId: undefined,
    pieceType: undefined,
    style: undefined,
    processType: undefined,
    estimatedElaborationTime: undefined,
    materialIds: undefined,
    curatorialCategory: undefined,
  });

  // Reset edits when product changes
  useEffect(() => {
    // Detectar si es producto LEGACY o MULTICAPA
    const isLegacyProduct = !(product as any).artisanalIdentity;

    setEdits({
      name: product.name,
      shortDescription: product.short_description || "",
      history: product.description || "",
      price: product.price,
      inventory: product.inventory || 0,
      weight: product.weight ?? null,
      dimensions: product.dimensions ?? null,
      images: Array.isArray(product.images) ? product.images : [],
      // Taxonomías (solo si es producto multicapa con artisanalIdentity)
      craftId: isLegacyProduct
        ? undefined
        : (product as any).artisanalIdentity?.primaryCraft?.id ||
          (product as any).artisanalIdentity?.primaryCraftId,
      primaryTechniqueId: isLegacyProduct
        ? undefined
        : (product as any).artisanalIdentity?.primaryTechnique?.id ||
          (product as any).artisanalIdentity?.primaryTechniqueId,
      secondaryTechniqueId: isLegacyProduct
        ? undefined
        : (product as any).artisanalIdentity?.secondaryTechnique?.id ||
          (product as any).artisanalIdentity?.secondaryTechniqueId,
      pieceType: isLegacyProduct
        ? undefined
        : (product as any).artisanalIdentity?.pieceType,
      style: isLegacyProduct
        ? undefined
        : (product as any).artisanalIdentity?.style,
      processType: isLegacyProduct
        ? undefined
        : (product as any).artisanalIdentity?.processType,
      estimatedElaborationTime: isLegacyProduct
        ? undefined
        : (product as any).artisanalIdentity?.estimatedElaborationTime,
      // Materiales: Legacy (array de strings UUID) vs Multicapa (array de objetos)
      materialIds: isLegacyProduct
        ? // Legacy: materials es array de strings UUID directamente
          Array.isArray((product as any).materials)
          ? (product as any).materials.filter((m: any) => typeof m === "string")
          : []
        : // Multicapa: materials es array de objetos con materialId
          (product as any).materials
            ?.map(
              (m: any) =>
                m.material?.id ||
                m.materialId ||
                (typeof m === "string" ? m : null),
            )
            .filter(Boolean) || [],
      curatorialCategory: isLegacyProduct
        ? undefined
        : (product as any).artisanalIdentity?.curatorialCategory?.id ||
          (product as any).artisanalIdentity?.curatorialCategoryId,
    });
    setComment("");
    setActiveTab("product");
  }, [product.id]);

  const hasEdits = () => {
    return (
      edits.name !== product.name ||
      edits.shortDescription !== (product.short_description || "") ||
      edits.history !== (product.description || "") ||
      edits.price !== product.price ||
      edits.inventory !== (product.inventory || 0) ||
      edits.weight !== (product.weight ?? null) ||
      JSON.stringify(edits.dimensions) !==
        JSON.stringify(product.dimensions ?? null)
    );
  };

  const resetEdits = () => {
    // Detectar si es producto LEGACY o MULTICAPA
    const isLegacyProduct = !(product as any).artisanalIdentity;

    setEdits({
      name: product.name,
      shortDescription: product.short_description || "",
      history: product.description || "",
      price: product.price,
      inventory: product.inventory || 0,
      weight: product.weight ?? null,
      dimensions: product.dimensions ?? null,
      images: Array.isArray(product.images) ? product.images : [],
      // Reset taxonomías (solo si es producto multicapa)
      craftId: isLegacyProduct
        ? undefined
        : (product as any).artisanalIdentity?.primaryCraft?.id ||
          (product as any).artisanalIdentity?.primaryCraftId,
      primaryTechniqueId: isLegacyProduct
        ? undefined
        : (product as any).artisanalIdentity?.primaryTechnique?.id ||
          (product as any).artisanalIdentity?.primaryTechniqueId,
      secondaryTechniqueId: isLegacyProduct
        ? undefined
        : (product as any).artisanalIdentity?.secondaryTechnique?.id ||
          (product as any).artisanalIdentity?.secondaryTechniqueId,
      pieceType: isLegacyProduct
        ? undefined
        : (product as any).artisanalIdentity?.pieceType,
      style: isLegacyProduct
        ? undefined
        : (product as any).artisanalIdentity?.style,
      processType: isLegacyProduct
        ? undefined
        : (product as any).artisanalIdentity?.processType,
      estimatedElaborationTime: isLegacyProduct
        ? undefined
        : (product as any).artisanalIdentity?.estimatedElaborationTime,
      // Reset materiales (Legacy vs Multicapa)
      materialIds: isLegacyProduct
        ? // Legacy: materials es array de strings UUID directamente
          Array.isArray((product as any).materials)
          ? (product as any).materials.filter((m: any) => typeof m === "string")
          : []
        : // Multicapa: materials es array de objetos
          (product as any).materials
            ?.map(
              (m: any) =>
                m.material?.id ||
                m.materialId ||
                (typeof m === "string" ? m : null),
            )
            .filter(Boolean) || [],
      curatorialCategory: isLegacyProduct
        ? undefined
        : (product as any).artisanalIdentity?.curatorialCategory?.id ||
          (product as any).artisanalIdentity?.curatorialCategoryId,
    });
  };

  const handleAction = async (
    action: "approve" | "approve_with_edits" | "request_changes" | "reject",
  ) => {
    const requiresComment = action === "request_changes" || action === "reject";
    if (requiresComment && !comment.trim()) return;

    const editedFields = hasEdits() ? edits : undefined;
    const finalAction = editedFields ? "approve_with_edits" : action;

    await onModerate(finalAction, comment || undefined, editedFields);
  };

  const handleTaxonomySave = (taxonomyData: any) => {
    setEdits((prev) => ({
      ...prev,
      ...taxonomyData,
    }));
  };

  return (
    <div className="space-y-3 pb-2">
      {/* Header with status */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <h2 className="text-base sm:text-lg font-semibold truncate max-w-[200px] sm:max-w-[340px]">
            {product.name}
          </h2>
          <ModerationStatusBadge status={product.moderation_status} />
        </div>
        {hasEdits() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetEdits}
            className="shrink-0"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Deshacer cambios</span>
            <span className="sm:hidden">Deshacer</span>
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="product" className="flex items-center gap-1">
            <Package className="w-4 h-4" />
            Producto
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <History className="w-4 h-4" />
            Historial
          </TabsTrigger>
        </TabsList>

        {/* Link to shop */}
        {product.artisan_shops && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              Tienda: <strong>{product.artisan_shops.shop_name}</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              Para aprobar esta tienda en el marketplace, usa el panel de
              Tiendas.
            </p>
          </div>
        )}

        {/* Product Tab */}
        <TabsContent value="product" className="space-y-4 mt-4">
          {/* Images */}
          {/* <Card>
            <CardContent className="pt-4">
              <ModerationImageViewer images={edits.images} />
            </CardContent>
          </Card> */}

          {/* Basic Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre del producto</Label>
                <Input
                  value={edits.name}
                  onChange={(e) =>
                    setEdits((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción corta</Label>
                <Input
                  value={edits.shortDescription}
                  onChange={(e) =>
                    setEdits((prev) => ({
                      ...prev,
                      shortDescription: e.target.value,
                    }))
                  }
                  placeholder="Breve descripción para listados..."
                />
              </div>
              <div className="space-y-2">
                <Label>Historia del producto</Label>
                <Textarea
                  value={edits.history}
                  onChange={(e) =>
                    setEdits((prev) => ({
                      ...prev,
                      history: e.target.value,
                    }))
                  }
                  placeholder="Cuéntanos la historia detrás de este producto..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                Precios e Inventario
                {edits.price > 0 && (
                  <span className="text-xs font-normal text-muted-foreground tabular-nums">
                    {formatCurrency(edits.price)}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Precio (COP)</Label>
                  <PriceInput
                    id="mod-price"
                    value={edits.price}
                    onChange={(price) =>
                      setEdits((prev) => ({ ...prev, price: price ?? 0 }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stock disponible</Label>
                  <Input
                    type="number"
                    min="0"
                    value={edits.inventory}
                    onChange={(e) =>
                      setEdits((prev) => ({
                        ...prev,
                        inventory: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Taxonomías */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                Taxonomías e Identidad Artesanal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                {edits.craftId && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Oficio:</span>
                    <span className="font-medium">Configurado ✓</span>
                  </div>
                )}
                {edits.primaryTechniqueId && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Técnica:</span>
                    <span className="font-medium">Configurado ✓</span>
                  </div>
                )}
                {edits.materialIds && edits.materialIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Materiales:</span>
                    <span className="font-medium">
                      {edits.materialIds.length} seleccionados
                    </span>
                  </div>
                )}
                {!edits.craftId && !edits.primaryTechniqueId && (
                  <p className="text-sm text-muted-foreground">
                    No se han configurado taxonomías
                  </p>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => setTaxonomyModalOpen(true)}
                className="w-full flex items-center gap-2"
              >
                <Tags className="w-4 h-4" />
                Editar Taxonomías
              </Button>
            </CardContent>
          </Card>

          {/* Shipping Data */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Datos de Envío
                </CardTitle>
                {edits.weight &&
                edits.dimensions?.length &&
                edits.dimensions?.width &&
                edits.dimensions?.height ? (
                  <span className="text-xs text-success flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Completo
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Incompleto
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label className="text-xs sm:text-sm">Peso</Label>
                  <WeightInput
                    id="mod-weight"
                    value={edits.weight}
                    onChange={(valueKg) =>
                      setEdits((prev) => ({ ...prev, weight: valueKg }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Largo (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={edits.dimensions?.length ?? ""}
                    onChange={(e) =>
                      setEdits((prev) => ({
                        ...prev,
                        dimensions: {
                          ...prev.dimensions,
                          length: e.target.value
                            ? Number(e.target.value)
                            : null,
                          width: prev.dimensions?.width ?? null,
                          height: prev.dimensions?.height ?? null,
                        },
                      }))
                    }
                    placeholder="ej: 30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Ancho (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={edits.dimensions?.width ?? ""}
                    onChange={(e) =>
                      setEdits((prev) => ({
                        ...prev,
                        dimensions: {
                          ...prev.dimensions,
                          length: prev.dimensions?.length ?? null,
                          width: e.target.value ? Number(e.target.value) : null,
                          height: prev.dimensions?.height ?? null,
                        },
                      }))
                    }
                    placeholder="ej: 20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Alto (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={edits.dimensions?.height ?? ""}
                    onChange={(e) =>
                      setEdits((prev) => ({
                        ...prev,
                        dimensions: {
                          ...prev.dimensions,
                          length: prev.dimensions?.length ?? null,
                          width: prev.dimensions?.width ?? null,
                          height: e.target.value
                            ? Number(e.target.value)
                            : null,
                        },
                      }))
                    }
                    placeholder="ej: 10"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Los datos de envío son necesarios para calcular costos de envío
                con Servientrega.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-4">
          {history.length > 0 ? (
            <ModerationHistory history={history} />
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Sin historial de moderación</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Moderation Actions - sticky inside ScrollArea */}
      <Card className="sticky bottom-0 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-t shadow-lg">
        <CardContent className="pt-3 pb-3 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm">
              Comentario para el artesano
            </Label>
            <Textarea
              placeholder="Escribe un comentario (obligatorio para pedir cambios o rechazar)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              size="sm"
              onClick={() => handleAction("approve")}
              disabled={moderating}
              className="bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm"
            >
              {moderating ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <CheckCircle className="w-3 h-3 mr-1" />
              )}
              Aprobar
            </Button>
            <Button
              size="sm"
              onClick={() => handleAction("approve_with_edits")}
              disabled={moderating || !hasEdits()}
              className="bg-teal-600 hover:bg-teal-700 text-xs sm:text-sm"
            >
              {moderating ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Edit className="w-3 h-3 mr-1" />
              )}
              <span className="hidden sm:inline">Con ediciones</span>
              <span className="sm:hidden">Ediciones</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction("request_changes")}
              disabled={moderating || !comment.trim()}
              className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950 text-xs sm:text-sm"
            >
              {moderating ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <AlertCircle className="w-3 h-3 mr-1" />
              )}
              <span className="hidden sm:inline">Pedir cambios</span>
              <span className="sm:hidden">Cambios</span>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleAction("reject")}
              disabled={moderating || !comment.trim()}
              className="text-xs sm:text-sm"
            >
              {moderating ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <XCircle className="w-3 h-3 mr-1" />
              )}
              Rechazar
            </Button>
          </div>

          {hasEdits() && (
            <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
              ⚠️ Tienes cambios sin guardar. Usa "Ediciones" para aplicarlos.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Modal de Taxonomías */}
      <ModerationTaxonomyModal
        open={taxonomyModalOpen}
        onOpenChange={setTaxonomyModalOpen}
        initialData={{
          craftId: edits.craftId,
          primaryTechniqueId: edits.primaryTechniqueId,
          secondaryTechniqueId: edits.secondaryTechniqueId,
          pieceType: edits.pieceType,
          style: edits.style,
          processType: edits.processType,
          estimatedElaborationTime: edits.estimatedElaborationTime,
          materialIds: edits.materialIds,
          curatorialCategory: edits.curatorialCategory,
        }}
        onSave={handleTaxonomySave}
      />
    </div>
  );
};
