import React from "react";
import {
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Package,
  Settings,
  Ruler,
  MapPin,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { PriceInput } from "@/components/ui/price-input";
import { WeightInput } from "@/components/ui/WeightInput";
import {
  WizardState,
  VariantOption,
  ProductVariant,
} from "../hooks/useWizardState";
import { SaveDraftButton } from "../components/SaveDraftButton";
import { ProductVariantsEditor } from "../components/ProductVariantsEditor";
import { toast } from "sonner";

interface Step4PriceCategoryProps {
  name: string;
  description: string;
  price: number | null;
  availabilityType?: "en_stock" | "bajo_pedido" | "edicion_limitada";
  sku?: string;
  inventory?: number;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  customizable?: boolean;
  madeToOrder?: boolean;
  leadTimeDays?: number;
  productionTimeHours?: number;
  allowsLocalPickup?: boolean;
  hasVariants?: boolean;
  variantOptions?: VariantOption[];
  variants?: ProductVariant[];
  isEditMode?: boolean;
  onDataChange: (data: {
    price?: number | null;
    availabilityType?: "en_stock" | "bajo_pedido" | "edicion_limitada";
    sku?: string;
    inventory?: number;
    weight?: number;
    dimensions?: { length: number; width: number; height: number };
    customizable?: boolean;
    madeToOrder?: boolean;
    leadTimeDays?: number;
    productionTimeHours?: number;
    allowsLocalPickup?: boolean;
    hasVariants?: boolean;
    variantOptions?: VariantOption[];
    variants?: ProductVariant[];
  }) => void;
  onNext: () => void;
  onPrevious: () => void;
  wizardState: WizardState;
}

export const Step4PriceCategory: React.FC<Step4PriceCategoryProps> = ({
  price,
  availabilityType,
  sku,
  inventory,
  weight,
  dimensions,
  customizable,
  madeToOrder,
  leadTimeDays,
  productionTimeHours,
  allowsLocalPickup,
  hasVariants,
  variantOptions = [],
  variants = [],
  onDataChange,
  onNext,
  onPrevious,
  wizardState,
  isEditMode,
}) => {
  const handleNext = () => {
    if (!price || price <= 0) {
      toast.error("Ingresa un precio válido");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Precio y detalles del producto</h2>
        <p className="text-muted-foreground">
          Configura precio, inventario y variantes de tu producto
        </p>
      </div>

      {/* SECCIÓN 1: Información Básica */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Información Básica</h3>
        </div>

        {/* Price Input */}
        <div>
          <PriceInput
            value={price}
            onChange={(newPrice) => onDataChange({ price: newPrice })}
            label="Precio (COP) *"
            placeholder="50.000"
            required
          />
        </div>
      </Card>

      {/* SECCIÓN 2: Disponibilidad */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Disponibilidad</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            type="button"
            variant={availabilityType === "en_stock" ? "default" : "outline"}
            onClick={() => onDataChange({ availabilityType: "en_stock" })}
            className="h-auto py-4 px-4 flex flex-col items-start justify-start text-left"
          >
            <span className="font-semibold text-base">EN STOCK</span>
            <span className="text-xs text-muted-foreground mt-1">
              Producto listo para entregar de inmediato
            </span>
          </Button>

          <Button
            type="button"
            variant={availabilityType === "bajo_pedido" ? "default" : "outline"}
            onClick={() => onDataChange({ availabilityType: "bajo_pedido" })}
            className="h-auto py-4 px-4 flex flex-col items-start justify-start text-left"
          >
            <span className="font-semibold text-base">BAJO PEDIDO</span>
            <span className="text-xs text-muted-foreground mt-1">
              Elaboración después del pedido
            </span>
          </Button>

          <Button
            type="button"
            variant={
              availabilityType === "edicion_limitada" ? "default" : "outline"
            }
            onClick={() =>
              onDataChange({ availabilityType: "edicion_limitada" })
            }
            className="h-auto py-4 px-4 flex flex-col items-start justify-start text-left"
          >
            <span className="font-semibold text-base">EDICIÓN LIMITADA</span>
            <span className="text-xs text-muted-foreground mt-1">
              Disponibilidad limitada, sin reposición
            </span>
          </Button>
        </div>
      </Card>

      {/* SECCIÓN 3: Inventario y Envío */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Inventario y Envío</h3>
        </div>

        {/* Inventory */}
        <div>
          <Label htmlFor="inventory">Cantidad disponible</Label>
          <Input
            id="inventory"
            type="number"
            value={inventory ?? 1}
            onChange={(e) =>
              onDataChange({ inventory: Number(e.target.value) || 1 })
            }
            placeholder="1"
          />
        </div>

        {/* Dimensions and Weight */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="length">Largo</Label>
            <Input
              id="length"
              type="number"
              value={dimensions?.length ?? ""}
              onChange={(e) =>
                onDataChange({
                  dimensions: {
                    length: e.target.value ? Number(e.target.value) : 0,
                    width: dimensions?.width || 0,
                    height: dimensions?.height || 0,
                  },
                })
              }
              placeholder="cm"
            />
          </div>

          <div>
            <Label htmlFor="width">Ancho</Label>
            <Input
              id="width"
              type="number"
              value={dimensions?.width ?? ""}
              onChange={(e) =>
                onDataChange({
                  dimensions: {
                    length: dimensions?.length || 0,
                    width: e.target.value ? Number(e.target.value) : 0,
                    height: dimensions?.height || 0,
                  },
                })
              }
              placeholder="cm"
            />
          </div>

          <div>
            <Label htmlFor="height">Alto</Label>
            <Input
              id="height"
              type="number"
              value={dimensions?.height ?? ""}
              onChange={(e) =>
                onDataChange({
                  dimensions: {
                    length: dimensions?.length || 0,
                    width: dimensions?.width || 0,
                    height: e.target.value ? Number(e.target.value) : 0,
                  },
                })
              }
              placeholder="cm"
            />
          </div>

          <div>
            <Label htmlFor="weight">Peso</Label>
            <WeightInput
              id="weight"
              value={weight ?? null}
              onChange={(valueKg) =>
                onDataChange({ weight: valueKg ?? undefined })
              }
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Opcional - Necesario para calcular costos de envío
        </p>
      </Card>

      {/* SECCIÓN 4: Variantes - COMENTADO */}
      {/* <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Variantes</h3>
        </div>

        <ProductVariantsEditor
          hasVariants={hasVariants || false}
          variantOptions={variantOptions}
          variants={variants}
          basePrice={price}
          onHasVariantsChange={(value) => onDataChange({ hasVariants: value })}
          onVariantOptionsChange={(options) =>
            onDataChange({ variantOptions: options })
          }
          onVariantsChange={(newVariants) =>
            onDataChange({ variants: newVariants })
          }
        />
      </Card> */}

      {/* SECCIÓN 5: Opciones de Producción - COMENTADO */}
      {/* <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Opciones de Producción</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="customizable"
              checked={customizable || false}
              onCheckedChange={(checked) =>
                onDataChange({ customizable: checked as boolean })
              }
            />
            <Label
              htmlFor="customizable"
              className="text-sm font-normal cursor-pointer"
            >
              Este producto es personalizable
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="madeToOrder"
              checked={madeToOrder || false}
              onCheckedChange={(checked) =>
                onDataChange({ madeToOrder: checked as boolean })
              }
            />
            <Label
              htmlFor="madeToOrder"
              className="text-sm font-normal cursor-pointer"
            >
              Se hace por encargo
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowsLocalPickup"
              checked={allowsLocalPickup || false}
              onCheckedChange={(checked) =>
                onDataChange({ allowsLocalPickup: checked as boolean })
              }
            />
            <Label
              htmlFor="allowsLocalPickup"
              className="text-sm font-normal cursor-pointer flex items-center gap-1"
            >
              <MapPin className="w-4 h-4" />
              Ofrecer retiro en local
            </Label>
          </div>
        </div>

        {madeToOrder && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label htmlFor="leadTimeDays">Días de entrega</Label>
              <Input
                id="leadTimeDays"
                type="number"
                value={leadTimeDays ?? 7}
                onChange={(e) =>
                  onDataChange({ leadTimeDays: Number(e.target.value) || 7 })
                }
                placeholder="7"
              />
            </div>

            <div>
              <Label htmlFor="productionTimeHours">Horas de producción</Label>
              <Input
                id="productionTimeHours"
                type="number"
                value={productionTimeHours ?? ""}
                onChange={(e) =>
                  onDataChange({
                    productionTimeHours: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Horas de trabajo"
              />
            </div>
          </div>
        )}
      </Card> */}

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
            <SaveDraftButton wizardState={wizardState} variant="outline" />
          )}

          <Button
            onClick={handleNext}
            disabled={!price}
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
