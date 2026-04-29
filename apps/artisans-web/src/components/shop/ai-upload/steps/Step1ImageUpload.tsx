import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Upload, X, ImageIcon, ArrowRight, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { WizardState, getImageUrl } from "../hooks/useWizardState";
import { SaveDraftButton } from "../components/SaveDraftButton";
import {
  getActiveCategories,
  type Category,
} from "@/services/categories.actions";

interface Step1ImageUploadProps {
  name: string;
  images: (File | string)[];
  productName: string;
  shortDescription: string;
  history: string;
  categoryId: string;
  onImagesChange: (images: (File | string)[]) => void;
  onProductNameChange: (name: string) => void;
  onShortDescriptionChange: (description: string) => void;
  onHistoryChange: (history: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onNext: () => void;
  wizardState: WizardState;
  isEditMode?: boolean;
  productIdToEdit?: string;
}

export const Step1ImageUpload: React.FC<Step1ImageUploadProps> = ({
  images,
  productName,
  shortDescription,
  history,
  categoryId,
  onImagesChange,
  onProductNameChange,
  onShortDescriptionChange,
  onHistoryChange,
  onCategoryChange,
  onNext,
  wizardState,
  isEditMode,
  productIdToEdit,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Cargar categorías activas
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getActiveCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error loading categories:", error);
        toast.error("Error al cargar las categorías");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Validar número de palabras en descripción corta
  const wordCount = shortDescription.trim().split(/\s+/).filter(Boolean).length;
  const isShortDescriptionValid = wordCount <= 100;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validImages = acceptedFiles.filter((file) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} no es una imagen válida`);
          return false;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} es muy grande (máx 10MB)`);
          return false;
        }

        return true;
      });

      if (validImages.length > 0) {
        const newImages = [...images, ...validImages].slice(0, 5); // Max 5 images
        onImagesChange(newImages);
        toast.success(`${validImages.length} imagen(es) agregada(s)`);
      }
    },
    [images, onImagesChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 5,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    toast.info("Imagen eliminada");
  };

  const handleNext = () => {
    // Validar campos obligatorios
    if (!productName.trim()) {
      toast.error("El nombre del producto es obligatorio");
      return;
    }

    if (!shortDescription.trim()) {
      toast.error("La descripción corta es obligatoria");
      return;
    }

    if (!isShortDescriptionValid) {
      toast.error("La descripción corta debe tener máximo 100 palabras");
      return;
    }

    if (images.length === 0) {
      toast.error("Sube al menos una imagen para continuar");
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Campos de información del producto */}
      <div className="space-y-4 text-left">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold italic">La pieza</h2>
          <p className="text-muted-foreground italic">
            Cuentanos sobre tu creacion. Un buen nombre y una descripcion
            atractiva ayudan a que tu producto destaque y venda más.
          </p>
        </div>

        {/* Nombre del producto */}
        <div className="space-y-2 text-left">
          <Label htmlFor="productName" className="block text-left">
            Nombre del producto <span className="text-red-500">*</span>
          </Label>
          <Input
            id="productName"
            value={productName}
            onChange={(e) => onProductNameChange(e.target.value)}
            placeholder="Ej: Bolso artesanal de lana"
            className="text-left"
          />
        </div>

        {/* Descripción corta */}
        <div className="space-y-2 text-left">
          <Label htmlFor="shortDescription" className="block text-left">
            Descripción corta <span className="text-red-500">*</span>
            <span
              className={`ml-2 text-xs ${
                isShortDescriptionValid
                  ? "text-muted-foreground"
                  : "text-red-500"
              }`}
            >
              ({wordCount}/100 palabras)
            </span>
          </Label>
          <Textarea
            id="shortDescription"
            value={shortDescription}
            onChange={(e) => onShortDescriptionChange(e.target.value)}
            placeholder="Describe tu producto en detalle (máximo 100 palabras)"
            className="text-left resize-none"
            rows={3}
          />
          {!isShortDescriptionValid && shortDescription.trim() && (
            <p className="text-xs text-red-500 text-left">
              La descripción debe tener máximo 100 palabras
            </p>
          )}
        </div>

        {/* Historia */}
        <div className="space-y-2 text-left">
          <Label htmlFor="history" className="block text-left">
            Historia
          </Label>
          <Textarea
            id="history"
            value={history}
            onChange={(e) => onHistoryChange(e.target.value)}
            placeholder="Cuéntanos la historia detrás de este producto (opcional)"
            className="text-left resize-none"
            rows={4}
          />
        </div>
      </div>

      {/* Selector de Categorías */}
      <div className="space-y-4 text-left">
        <div className="space-y-2">
          <Label className="block text-left">Selecciona una categoría</Label>

          {loadingCategories ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                Cargando categorías...
              </span>
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  type="button"
                  variant={categoryId === category.id ? "default" : "outline"}
                  onClick={() => onCategoryChange(category.id)}
                  className="h-auto py-3 px-4 text-left justify-start"
                >
                  <span className="truncate">{category.name}</span>
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay categorías disponibles</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 text-left">
        {/* Upload Area */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Imágenes del producto</h3>

          <div
            {...getRootProps()}
            className={`
            border-2 bg-white border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
            ${
              dragActive || isDragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }
          `}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload
                  className={`w-12 h-12 ${dragActive ? "text-primary" : "text-muted-foreground"}`}
                />
              </div>

              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {dragActive
                    ? "¡Suelta las imágenes aquí!"
                    : "Sube las fotos de tu producto"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Arrastra y suelta o haz clic para seleccionar
                </p>
                <p className="text-xs text-muted-foreground">
                  Máximo 5 imágenes • JPG, PNG, WEBP • Máx 10MB cada una
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            Imágenes seleccionadas ({images.length}/5)
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={getImageUrl(image)}
                    alt={`Producto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Image info */}
                <div className="mt-2 text-xs text-muted-foreground text-center">
                  <p className="truncate">
                    {typeof image === 'string'
                      ? `Imagen ${index + 1}`
                      : image.name}
                  </p>
                  {typeof image !== 'string' && (
                    <p>{Math.round(image.size / 1024)}KB</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h4 className="font-medium flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Consejos para mejores fotos
        </h4>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground text-left">
          <li>• Usa buena iluminación natural</li>
          <li>• Incluye diferentes ángulos</li>
          <li>• Muestra texturas y acabados</li>
          <li>• Usa fondos simples</li>
          <li className="">
            • La primera imagen será la principal en tu tienda
          </li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        {(!isEditMode || wizardState.status === 'draft') && (
          <SaveDraftButton wizardState={wizardState} productId={productIdToEdit} variant="outline" />
        )}

        <Button
          onClick={handleNext}
          disabled={
            !productName.trim() ||
            !shortDescription.trim() ||
            !isShortDescriptionValid ||
            images.length === 0
          }
          className="flex items-center gap-2"
        >
          Continuar
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
