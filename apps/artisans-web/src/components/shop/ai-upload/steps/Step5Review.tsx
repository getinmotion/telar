import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit3,
  Upload,
  Check,
  Loader2,
  Save,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useImageUpload } from "../hooks/useImageUpload";
import { WizardState, getImageUrl } from "../hooks/useWizardState";
import { deleteUploadedFile } from "@/services/fileUpload.actions";
import { useAuth } from "@/context/AuthContext";
import { getArtisanShopByUserId } from "@/services/artisanShops.actions";
import {
  createProduct,
  getProductsByShopId,
  getProductById,
} from "@/services/products.actions";
import { createVariant } from "@/services/productVariants.actions";
import {
  createProductNew,
  mapWizardStateToCreateDto,
} from "@/services/products-new.actions";
import { updateAgentTask } from "@/services/agentTasks.actions";
import { toast } from "sonner";
import { EventBus } from "@/utils/eventBus";
import { useGamificationRewards } from "@/hooks/useGamificationRewards";
import { XP_REWARDS } from "@/constants/gamification";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTaskRoutingAnalytics } from "@/hooks/analytics/useTaskRoutingAnalytics";
import { ProductSuccessModal } from "@/components/shop/upload/ProductSuccessModal";
import {
  getAllCrafts,
  getTechniquesByCraftId,
} from "@/services/crafts.actions";
import { getApprovedMaterials } from "@/services/materials.actions";
import { getCuratorialCategories } from "@/services/curatorial-categories.actions";

interface Step5ReviewProps {
  wizardState: WizardState;
  onEdit: (step: number) => void;
  onPublish: () => void;
  onPrevious: () => void;
  isEditMode?: boolean;
  productIdToEdit?: string;
}

export const Step5Review: React.FC<Step5ReviewProps> = ({
  wizardState,
  onEdit,
  onPublish,
  onPrevious,
  isEditMode = false,
  productIdToEdit,
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [publishedProductId, setPublishedProductId] = useState<string>("");
  const [publishedProductName, setPublishedProductName] = useState<string>("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const taskId = searchParams.get("taskId");
  const { uploadImages, uploadProgress, isUploading } = useImageUpload();
  const { awardXP } = useGamificationRewards();
  const { updateRoutingCompletion } = useTaskRoutingAnalytics();
  const { user } = useAuth();

  // States para nombres
  const [craftName, setCraftName] = useState<string>("");
  const [techniqueNames, setTechniqueNames] = useState<{
    primary: string;
    secondary: string;
  }>({ primary: "", secondary: "" });
  const [materialNames, setMaterialNames] = useState<string[]>([]);
  const [curatorialCategoryName, setCuratorialCategoryName] =
    useState<string>("");

  // Cargar nombres desde las APIs
  useEffect(() => {
    const loadNames = async () => {
      try {
        // Cargar craft name
        if (wizardState.craftId) {
          const crafts = await getAllCrafts();
          const craft = crafts.find((c) => c.id === wizardState.craftId);
          if (craft) setCraftName(craft.name);
        }

        // Cargar technique names
        if (wizardState.craftId && wizardState.primaryTechniqueId) {
          const techniques = await getTechniquesByCraftId(wizardState.craftId);
          const primary = techniques.find(
            (t) => t.id === wizardState.primaryTechniqueId,
          );
          const secondary = wizardState.secondaryTechniqueId
            ? techniques.find((t) => t.id === wizardState.secondaryTechniqueId)
            : null;
          setTechniqueNames({
            primary: primary?.name || "",
            secondary: secondary?.name || "",
          });
        }

        // Cargar material names
        if (wizardState.materials && wizardState.materials.length > 0) {
          const materials = await getApprovedMaterials();
          const names = wizardState.materials
            .map((id) => materials.find((m) => m.id === id)?.name)
            .filter(Boolean) as string[];
          setMaterialNames(names);
        }

        // Cargar curatorial category name
        if (wizardState.curatorialCategory) {
          const categories = await getCuratorialCategories();
          const category = categories.find(
            (c) => c.id === wizardState.curatorialCategory,
          );
          if (category) setCuratorialCategoryName(category.name);
        }
      } catch (error) {
        console.error("Error loading names:", error);
      }
    };

    loadNames();
  }, [
    wizardState.craftId,
    wizardState.primaryTechniqueId,
    wizardState.secondaryTechniqueId,
    wizardState.materials,
    wizardState.curatorialCategory,
  ]);

  // Check if shipping data is complete
  const hasCompleteShippingData = !!(
    wizardState.weight &&
    wizardState.weight > 0 &&
    wizardState.dimensions?.length &&
    wizardState.dimensions?.width &&
    wizardState.dimensions?.height
  );

  // Comprehensive validation before publishing
  const validateForPublishing = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    console.log("🔍 VALIDACIÓN PRE-PUBLICACIÓN...");
    console.log("📋 Estado del wizard:", {
      imagesCount: wizardState.images.length,
      name: wizardState.name,
      description: wizardState.description?.length,
      price: wizardState.price,
      category: wizardState.category,
    });

    if (!wizardState.images || wizardState.images.length === 0) {
      errors.push("Debes subir al menos una imagen");
    }

    if (!wizardState.name?.trim()) {
      errors.push("El nombre del producto es obligatorio");
    }

    if (!wizardState.description?.trim()) {
      errors.push("La descripción del producto es obligatoria");
    }

    if (!wizardState.price || wizardState.price <= 0) {
      errors.push("Debes establecer un precio válido");
    }

    if (!wizardState.category?.trim()) {
      errors.push("Debes seleccionar una categoría");
    }

    console.log("✅ Validación completada:", {
      isValid: errors.length === 0,
      errors,
    });
    return { isValid: errors.length === 0, errors };
  };

  // Retry function with exponential backoff
  const retryOperation = async <T,>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000,
  ): Promise<T> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Intento ${attempt}/${maxRetries}`);
        const result = await operation();
        console.log(`✅ Operación exitosa en intento ${attempt}`);
        return result;
      } catch (error) {
        console.log(`❌ Intento ${attempt} falló:`, error);

        if (attempt === maxRetries) {
          throw error;
        }

        const delay = delayMs * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`⏰ Esperando ${delay}ms antes del próximo intento...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error("Máximo número de intentos alcanzado");
  };

  const handlePublish = async () => {
    console.log("🚀 INICIANDO PROCESO DE PUBLICACIÓN...");

    const validation = validateForPublishing();
    if (!validation.isValid) {
      toast.error("Faltan datos obligatorios", {
        description: validation.errors.join(", "),
      });
      return;
    }

    if (!user) {
      toast.error("Usuario no autenticado. Por favor, inicia sesión.");
      return;
    }

    setIsPublishing(true);
    let uploadedImageUrls: string[] = [];

    try {
      // PASO 1: Verificar tienda del usuario
      console.log("🏪 VERIFICANDO TIENDA DEL USUARIO...");
      const shopData = await getArtisanShopByUserId(user.id);

      if (!shopData) {
        toast.error("No tienes una tienda activa", {
          description: "Crea tu tienda antes de publicar productos",
          action: {
            label: "Crear tienda",
            onClick: () => (window.location.href = "/crear-tienda"),
          },
        });
        throw new Error("No tienes una tienda activa. Crea tu tienda primero.");
      }

      console.log("✅ TIENDA VERIFICADA:", {
        id: shopData.id,
        name: shopData.shopName,
      });

      // PASO 2: Subir imágenes (solo las nuevas - tipo File)
      const imagesToUpload = wizardState.images.filter((img): img is File => typeof img !== 'string');
      const existingImageUrls = wizardState.images.filter((img): img is string => typeof img === 'string');

      if (imagesToUpload.length > 0) {
        console.log(`📤 SUBIENDO ${imagesToUpload.length} NUEVAS IMÁGENES...`);
        toast.info("Subiendo imágenes...", {
          description: `Procesando ${imagesToUpload.length} imagen(es)`,
        });

        try {
          const newUploadedUrls = await uploadImages(imagesToUpload);
          if (newUploadedUrls.length === 0) {
            throw new Error(
              "No se pudieron generar URLs válidas para las imágenes",
            );
          }
          uploadedImageUrls = [...existingImageUrls, ...newUploadedUrls];
          console.log("✅ IMÁGENES SUBIDAS:", uploadedImageUrls);
        } catch (uploadError) {
          throw new Error(
            `Error subiendo imágenes: ${uploadError instanceof Error ? uploadError.message : "Error desconocido"}`,
          );
        }
      } else {
        // Usar solo las imágenes existentes
        uploadedImageUrls = existingImageUrls;
        console.log("✅ USANDO IMÁGENES EXISTENTES:", uploadedImageUrls);
      }

      // PASO 3: Crear o actualizar producto usando products-new (arquitectura multicapa)
      const actionText = isEditMode ? "ACTUALIZANDO" : "CREANDO";
      console.log(`💾 ${actionText} PRODUCTO...`);
      toast.info(isEditMode ? "Actualizando producto..." : "Creando producto...", {
        description: "Guardando en la base de datos",
      });

      const createDto = mapWizardStateToCreateDto(
        wizardState,
        shopData.id,
        uploadedImageUrls
      );

      // Si estamos en modo edición, agregar productId al DTO
      if (isEditMode && productIdToEdit) {
        createDto.productId = productIdToEdit;
      }

      // Cambiar status a pending_moderation para publicación
      createDto.status = 'pending_moderation';

      console.log(`📋 DTO generado para ${isEditMode ? 'actualización' : 'publicación'}:`, createDto);

      const createdProduct = await createProductNew(createDto);
      console.log("✅ PRODUCTO CREADO:", {
        id: createdProduct.id,
        name: createdProduct.name,
      });

      // NOTA: Las variantes ahora se crean automáticamente en el DTO
      // La variante default con precio e inventario se incluye en createDto.variants
      // NO necesitamos crear variantes por separado

      // PASO 5: Contar productos para gamificación
      let isFirstProduct = false;
      let productCount = 1;
      try {
        const existingProducts = await getProductsByShopId(shopData.id);
        isFirstProduct = existingProducts.length <= 1;
        productCount = existingProducts.length;
      } catch {
        // No bloquear el flujo si falla el conteo
      }

      // PASO 6: Gamificación — otorgar XP
      const xpAmount = isFirstProduct
        ? XP_REWARDS.PRODUCT_UPLOAD + XP_REWARDS.FIRST_PRODUCT
        : XP_REWARDS.PRODUCT_UPLOAD;
      const xpReason = isFirstProduct
        ? "¡Primer Producto Subido! 🎉"
        : "Producto Subido";
      console.log(`🎯 Awarding ${xpAmount} XP (first: ${isFirstProduct})`);
      await awardXP(xpAmount, xpReason, true, 5);

      // PASO 7: Publicar eventos al Master Coordinator
      EventBus.publish("inventory.updated", {
        productId: createdProduct.id,
        shopId: shopData.id,
        action: "product_created",
        productName: wizardState.name,
      });
      EventBus.publish("product.wizard.completed", {
        userId: user.id,
        taskId: taskId || "inventory-first-products",
        productId: createdProduct.id,
        isFirstProduct,
        productCount,
      });
      EventBus.publish("master.full.sync", { source: "product_upload" });

      // PASO 8: Marcar tarea como completada si viene desde una tarea
      if (taskId) {
        try {
          await updateAgentTask(taskId, {
            status: "completed",
            progressPercentage: 100,
          });
          console.log("✅ Task marked as completed");
        } catch (taskError) {
          console.error("❌ Error marking task as completed:", taskError);
        }

        await updateRoutingCompletion({
          taskId,
          wasSuccessful: true,
          completionMethod: "wizard",
        });
      }

      // PASO 9: Éxito
      console.log(`🎉 PRODUCTO ${isEditMode ? 'ACTUALIZADO' : 'PUBLICADO'} EXITOSAMENTE:`, createdProduct.id);
      setPublishedProductId(createdProduct.id);
      setPublishedProductName(wizardState.name);
      setShowSuccessModal(true);
      onPublish();

      toast.success(isEditMode ? "¡Producto actualizado exitosamente!" : "¡Producto publicado exitosamente!", {
        description: `"${wizardState.name}" ${isEditMode ? 'ha sido actualizado' : 'ya está disponible en tu tienda'}`,
        duration: 4000,
      });
    } catch (error) {
      console.error(
        "❌ ERROR CRÍTICO EN PUBLICACIÓN:",
        error instanceof Error ? error.message : error,
      );

      // Rollback imágenes si el producto falló
      if (uploadedImageUrls.length > 0) {
        console.log("🗑️ INICIANDO ROLLBACK DE IMÁGENES...");
        await Promise.allSettled(
          uploadedImageUrls.map((url) =>
            deleteUploadedFile(url).catch((err) =>
              console.error("❌ ERROR EN ROLLBACK de imagen:", url, err),
            ),
          ),
        );
        console.log("✅ ROLLBACK COMPLETADO");
      }

      toast.error("Error al publicar producto", {
        description:
          error instanceof Error ? error.message : "Error desconocido",
        duration: 10000,
        action: { label: "Reintentar", onClick: () => handlePublish() },
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Save as draft function
  const handleSaveDraft = async () => {
    console.log("💾 GUARDANDO COMO BORRADOR...");

    if (!wizardState.images || wizardState.images.length === 0) {
      toast.error("Debes subir al menos una imagen");
      return;
    }
    if (!wizardState.name?.trim()) {
      toast.error("El nombre del producto es obligatorio");
      return;
    }
    if (!wizardState.price || wizardState.price <= 0) {
      toast.error("Debes establecer un precio válido");
      return;
    }
    if (!user) {
      toast.error("Usuario no autenticado. Por favor, inicia sesión.");
      return;
    }

    setIsSavingDraft(true);
    let uploadedImageUrls: string[] = [];

    try {
      // Verificar tienda
      const shopData = await getArtisanShopByUserId(user.id);
      if (!shopData) throw new Error("No tienes una tienda activa");

      // Subir imágenes (solo las nuevas - tipo File)
      const imagesToUpload = wizardState.images.filter((img): img is File => typeof img !== 'string');
      const existingImageUrls = wizardState.images.filter((img): img is string => typeof img === 'string');

      if (imagesToUpload.length > 0) {
        toast.info("Subiendo imágenes...", {
          description: `Procesando ${imagesToUpload.length} imagen(es)`,
        });
        const newUploadedUrls = await uploadImages(imagesToUpload);
        if (newUploadedUrls.length === 0)
          throw new Error("No se pudieron subir las imágenes");
        uploadedImageUrls = [...existingImageUrls, ...newUploadedUrls];
      } else {
        uploadedImageUrls = existingImageUrls;
      }

      // Crear o actualizar producto como borrador usando products-new (arquitectura multicapa)
      const createDto = mapWizardStateToCreateDto(
        wizardState,
        shopData.id,
        uploadedImageUrls
      );

      // Si estamos en modo edición, agregar productId al DTO
      if (isEditMode && productIdToEdit) {
        createDto.productId = productIdToEdit;
      }

      console.log("📋 DTO generado para borrador:", createDto);

      const draftProduct = await createProductNew(createDto);

      console.log("✅ BORRADOR GUARDADO:", draftProduct.id);
      onPublish();

      toast.success("Borrador guardado", {
        description: "Puedes completar los datos de envío desde tu inventario",
        action: {
          label: "Ver inventario",
          onClick: () => navigate("/dashboard/inventory"),
        },
      });

      navigate("/dashboard/inventory");
    } catch (error) {
      console.error("❌ ERROR GUARDANDO BORRADOR:", error);

      if (uploadedImageUrls.length > 0) {
        await Promise.allSettled(
          uploadedImageUrls.map((url) =>
            deleteUploadedFile(url).catch((err) =>
              console.error("Error en rollback de imagen:", url, err),
            ),
          ),
        );
      }

      toast.error("Error al guardar borrador", {
        description:
          error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Revisión final</h2>
        <p className="text-muted-foreground">
          Revisa todos los detalles antes de publicar tu producto
        </p>
      </div>

      {/* Product Preview */}
      <Card className="overflow-hidden ">
        <div className="p-6">
          {/* Main Product Section - Layout similar to the image */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Main Image */}
            <div className="space-y-3">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                {wizardState.images.length > 0 && (
                  <img
                    src={getImageUrl(wizardState.images[0])}
                    alt={wizardState.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              {/* Thumbnails */}
              {wizardState.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {wizardState.images.slice(1, 5).map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-md overflow-hidden bg-muted"
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`Producto ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="space-y-4 text-left">
              {/* Category/Craft Tag */}
              {(wizardState.category || craftName) && (
                <p className="text-xs font-medium text-primary uppercase tracking-wider">
                  {craftName && wizardState.category
                    ? `${craftName} • ${wizardState.category}`
                    : craftName || wizardState.category}
                </p>
              )}

              {/* Product Name */}
              <h1 className="text-3xl font-bold text-foreground">
                {wizardState.name}
              </h1>

              {/* Short Description */}
              {wizardState.shortDescription && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {wizardState.shortDescription}
                </p>
              )}

              {/* Badges - Materials, Techniques, etc */}
              <div className="flex flex-wrap gap-2">
                {materialNames.length > 0 &&
                  materialNames.slice(0, 2).map((materialName) => (
                    <Badge
                      key={materialName}
                      variant="outline"
                      className="text-xs uppercase"
                    >
                      {materialName}
                    </Badge>
                  ))}
                {techniqueNames.primary && (
                  <Badge variant="outline" className="text-xs uppercase">
                    {techniqueNames.primary}
                  </Badge>
                )}
                {wizardState.processType && (
                  <Badge variant="outline" className="text-xs uppercase">
                    100% {wizardState.processType}
                  </Badge>
                )}
              </div>

              {/* Price */}
              <div className="pt-2">
                <p className="text-3xl font-bold text-foreground">
                  ${wizardState.price?.toLocaleString()}{" "}
                  <span className="text-base font-normal text-muted-foreground">
                    COP
                  </span>
                </p>
              </div>

              {/* Availability Status */}
              {wizardState.availabilityType && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="font-medium text-green-600 uppercase">
                    {wizardState.availabilityType.replace("_", " ")}
                    {wizardState.inventory &&
                      ` (${wizardState.inventory} disponibles)`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* History Section (if exists) */}
          {wizardState.history && (
            <>
              <Separator className="my-6" />
              <div className="space-y-2 text-left">
                <h3 className="font-semibold">Historia</h3>
                <p className="text-muted-foreground leading-relaxed italic">
                  {wizardState.history}
                </p>
              </div>
            </>
          )}

          {/* Description Section */}
          {wizardState.description && (
            <>
              <Separator className="my-6" />
              <div className="space-y-2 text-left">
                <h3 className="font-semibold">Descripción</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {wizardState.description}
                </p>
              </div>
            </>
          )}

          {/* Proceso Artesanal */}
          {(wizardState.materials ||
            wizardState.primaryTechniqueId ||
            wizardState.estimatedElaborationTime) && (
            <>
              <Separator className="my-6" />
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Proceso artesanal</h3>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {wizardState.materials &&
                    wizardState.materials.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                          Materiales
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {materialNames.length > 0
                            ? materialNames.map((materialName) => (
                                <Badge
                                  key={materialName}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {materialName}
                                </Badge>
                              ))
                            : wizardState.materials.map((materialId) => (
                                <Badge
                                  key={materialId}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {materialId}
                                </Badge>
                              ))}
                        </div>
                      </div>
                    )}

                  {wizardState.primaryTechniqueId && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Técnica
                      </p>
                      <div className="space-y-1">
                        <Badge variant="secondary">
                          {techniqueNames.primary ||
                            wizardState.primaryTechniqueId}
                        </Badge>
                        {wizardState.secondaryTechniqueId && (
                          <Badge variant="outline" className="ml-1">
                            {techniqueNames.secondary ||
                              wizardState.secondaryTechniqueId}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {wizardState.estimatedElaborationTime && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Tiempo de elaboración
                      </p>
                      <p className="text-sm font-semibold">
                        {wizardState.estimatedElaborationTime} días
                      </p>
                    </div>
                  )}
                </div>

                {/* Additional artisan info */}
                <div className="grid md:grid-cols-3 gap-4 pt-2">
                  {wizardState.craftId && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Oficio artesanal
                      </p>
                      <Badge variant="secondary">
                        {craftName || wizardState.craftId}
                      </Badge>
                    </div>
                  )}

                  {wizardState.pieceType && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Tipo de pieza
                      </p>
                      <Badge variant="secondary" className="capitalize">
                        {wizardState.pieceType.replace("_", " ")}
                      </Badge>
                    </div>
                  )}

                  {wizardState.style && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Estilo
                      </p>
                      <Badge variant="secondary" className="capitalize">
                        {wizardState.style}
                      </Badge>
                    </div>
                  )}

                  {wizardState.processType && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Proceso
                      </p>
                      <Badge variant="secondary" className="capitalize">
                        {wizardState.processType}
                      </Badge>
                    </div>
                  )}

                  {wizardState.curatorialCategory && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Categoría curatorial
                      </p>
                      <Badge variant="secondary">
                        {curatorialCategoryName ||
                          wizardState.curatorialCategory}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Detalles Técnicos */}
          {(wizardState.dimensions ||
            wizardState.weight ||
            wizardState.availabilityType) && (
            <>
              <Separator className="my-6" />
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Detalles técnicos</h3>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {wizardState.dimensions && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Dimensiones
                      </p>
                      <p className="text-sm">
                        {wizardState.dimensions.length} x{" "}
                        {wizardState.dimensions.width} x{" "}
                        {wizardState.dimensions.height} cm
                      </p>
                    </div>
                  )}

                  {wizardState.weight && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Peso
                      </p>
                      <p className="text-sm font-semibold">
                        {wizardState.weight} kg
                      </p>
                    </div>
                  )}

                  {wizardState.availabilityType && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Disponibilidad
                      </p>
                      <Badge variant="secondary" className="uppercase">
                        {wizardState.availabilityType.replace("_", " ")}
                      </Badge>
                    </div>
                  )}
                </div>

                {wizardState.inventory && (
                  <div className="space-y-2 pt-2">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Cantidad disponible
                    </p>
                    <p className="text-sm font-semibold">
                      {wizardState.inventory} unidades
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Tags */}
          {wizardState.tags.length > 0 && (
            <>
              <Separator className="my-6" />
              <div className="space-y-2">
                <h3 className="font-semibold">Etiquetas</h3>
                <div className="flex flex-wrap gap-2">
                  {wizardState.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Variants */}
          {wizardState.hasVariants &&
            wizardState.variants &&
            wizardState.variants.length > 0 && (
              <>
                <Separator className="my-6" />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      Variantes ({wizardState.variants.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {wizardState.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="p-2 bg-muted/50 rounded-lg text-sm"
                      >
                        <div className="flex flex-wrap gap-1 mb-1">
                          {Object.entries(variant.optionValues).map(
                            ([key, value]) => (
                              <Badge
                                key={key}
                                variant="secondary"
                                className="text-xs"
                              >
                                {value}
                              </Badge>
                            ),
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${variant.price.toLocaleString()} · {variant.stock}{" "}
                          unid.
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Stock total:{" "}
                    {wizardState.variants.reduce((sum, v) => sum + v.stock, 0)}{" "}
                    unidades
                  </p>
                </div>
              </>
            )}
        </div>
      </Card>

      {/* Upload Progress */}
      {isUploading && uploadProgress.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Subiendo imágenes...</h3>
          <div className="space-y-2">
            {uploadProgress.map((progress, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{progress.fileName}</p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${
                        progress.status === "error"
                          ? "bg-destructive"
                          : progress.status === "completed"
                            ? "bg-success"
                            : "bg-primary"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {progress.status === "completed" && (
                  <Check className="w-4 h-4 text-success" />
                )}
                {progress.status === "error" && (
                  <span className="text-xs text-destructive">
                    {progress.error}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>

        <div className="flex gap-3">
          {/* Mostrar botón "Guardar borrador" solo si no está en modo edición O si está en draft */}
          {(!isEditMode || wizardState.status === 'draft') && (
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSavingDraft || isPublishing || isUploading}
              className="flex items-center gap-2"
            >
              {isSavingDraft ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSavingDraft ? "Guardando..." : "Guardar borrador"}
            </Button>
          )}

          <Button
            onClick={handlePublish}
            disabled={isPublishing || isUploading || isSavingDraft}
            className="flex items-center gap-2 bg-success hover:bg-success/90"
          >
            {isPublishing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isPublishing
              ? (isEditMode ? "Actualizando..." : "Enviando...")
              : (isEditMode ? "Actualizar" : "Enviar a revisión")}
          </Button>
        </div>
      </div>

      {/* Success Modal */}
      <ProductSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onPublish(); // Reset wizard cuando cierra el modal
        }}
        productId={publishedProductId}
        productName={publishedProductName}
        onEditProduct={() => {
          setShowSuccessModal(false);
          navigate(`/productos/editar/${publishedProductId}`);
        }}
        onUploadAnother={() => {
          setShowSuccessModal(false);
          onPublish(); // Reset wizard para nueva carga
        }}
        onViewInventory={() => {
          setShowSuccessModal(false);
          navigate("/dashboard/inventory");
        }}
        onViewShop={() => {
          setShowSuccessModal(false);
          navigate("/mi-tienda");
        }}
      />
    </div>
  );
};
