import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2,
  CheckCircle,
  Package,
  User,
  Ruler,
  Scale,
  Shield,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Edit,
} from "lucide-react";
import {
  getInfoBuyerIdentityById,
  updateInfoBuyerIdentity,
} from "@/services/infoBuyerIdentity.actions";
import { type ProductNewCore } from "@/services/products-new.actions";
import type { InfoBuyerIdentity } from "@/services/infoBuyerIdentity.actions";
import { telarApi } from "@/integrations/api/telarApi";
import { toast } from "sonner";

export const ProductIdentityPage = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buyerInfo, setBuyerInfo] = useState<InfoBuyerIdentity | null>(null);
  const [product, setProduct] = useState<ProductNewCore | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    origin: true,
    physical: true,
    materials: true,
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    email: "",
    celular: "",
  });

  const toggleSection = (section: "origin" | "physical" | "materials") => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleOpenModal = () => {
    // Pre-fill form with existing data
    if (buyerInfo) {
      setFormData({
        nombreCompleto: buyerInfo.nombreCompleto || "",
        email: buyerInfo.email || "",
        celular: buyerInfo.celular || "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmitUpdate = async () => {
    if (!buyerInfo) return;

    try {
      setIsSubmitting(true);
      const updatedInfo = await updateInfoBuyerIdentity(buyerInfo.id, formData);
      setBuyerInfo(updatedInfo);
      toast.success("Información actualizada correctamente");
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error updating info:", error);
      toast.error(error.message || "Error al actualizar la información");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const loadProductIdentity = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener parámetros de la URL
        const skuParam = searchParams.get("sku");

        if (!skuParam) {
          setError("Parámetros inválidos en la URL");
          return;
        }

        // Parsear SKU y ID: formato "sku_prod-id_info_buyer_identity"
        const parts = skuParam.split("-");
        if (parts.length < 2) {
          setError("Formato de SKU inválido");
          return;
        }

        const buyerIdentityId = parseInt(parts[parts.length - 1], 10);

        if (isNaN(buyerIdentityId)) {
          setError("ID de identidad inválido");
          return;
        }

        // Obtener información del comprador
        const buyerData = await getInfoBuyerIdentityById(buyerIdentityId);
        setBuyerInfo(buyerData);

        // Obtener información del producto usando API autenticada para obtener todas las relaciones
        const productResponse = await telarApi.get<ProductNewCore>(`/products-new/${buyerData.productId}`);
        const productData = productResponse.data;
        console.log('Product Data:', productData);
        console.log('Physical Specs:', productData.physicalSpecs);
        setProduct(productData);
      } catch (err: any) {
        console.error("Error loading product identity:", err);
        setError(err.message || "Error al cargar la información del producto");
      } finally {
        setLoading(false);
      }
    };

    loadProductIdentity();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">
            Cargando información del producto...
          </p>
        </div>
      </div>
    );
  }

  if (error || !buyerInfo || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <Package className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">Producto no encontrado</h2>
            <p className="text-muted-foreground">
              {error || "No se pudo cargar la información del producto"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generar ID de pasaporte basado en el año y el ID
  const currentYear = new Date().getFullYear();
  const passportId = `TLR-PV-${currentYear}-${buyerInfo.id.toString().padStart(4, "0")}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header - Passport ID and Status */}
        <Card className="border-2 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Pasaporte Digital de Producto
                </h1>
                <p className="text-xl font-mono text-primary">{passportId}</p>
              </div>
              <Badge className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Pasaporte Preparado
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Product Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Images Gallery */}
            {product.media && product.media.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Imágenes del Producto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {product.media.map((media, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-muted hover:border-primary transition-colors"
                      >
                        <img
                          src={
                            media.mediaUrl.startsWith("http")
                              ? media.mediaUrl
                              : `https://your-cdn-url.com${media.mediaUrl}`
                          }
                          alt={`${product.name} - Imagen ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {media.isPrimary && (
                          <Badge className="absolute top-2 left-2 bg-primary">
                            Principal
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Product Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Información del Producto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-left">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground text-justify">
                    {product.shortDescription ||
                      product.history ||
                      "Sin descripción"}
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">SKU</p>
                    <p className="font-mono">{buyerInfo.skuProduct}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Artisan Information - Collapsible */}
            <Card>
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection("origin")}
              >
                <div className="flex items-left justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Origen y Autoría
                  </CardTitle>
                  {expandedSections.origin ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </CardHeader>
              {expandedSections.origin && (
                <CardContent className="space-y-4 border-t text-left">
                  {product.artisanShop && (
                    <>
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">
                          Artesano/Marca
                        </p>
                        <p className="font-semibold text-lg">
                          {product.artisanShop.shopName || "No especificado"}
                        </p>
                      </div>

                      {(product.artisanShop.municipality ||
                        product.artisanShop.department ||
                        product.artisanShop.region) && (
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">
                            Ubicación
                          </p>
                          <p className="font-medium">
                            {[
                              product.artisanShop.municipality,
                              product.artisanShop.department,
                              product.artisanShop.region,
                            ]
                              .filter(Boolean)
                              .join(", ")
                              .toUpperCase() || "No especificada"}
                          </p>
                        </div>
                      )}

                      {product.artisanShop.craftType && (
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">
                            Tipo de artesanía
                          </p>
                          <p className="font-medium capitalize">
                            {product.artisanShop.craftType}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {product.category && (
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">
                        Categoría
                      </p>
                      <p className="font-medium capitalize">
                        {typeof product.category === "object" && product.category.name
                          ? product.category.name
                          : "Artesanía"}
                      </p>
                    </div>
                  )}

                  {product.artisanalIdentity?.primaryCraft && (
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">
                        Oficio Principal
                      </p>
                      <p className="font-medium capitalize">
                        {product.artisanalIdentity.primaryCraft.name}
                      </p>
                    </div>
                  )}

                  {product.artisanalIdentity?.primaryTechnique && (
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">
                        Técnica Principal
                      </p>
                      <p className="font-medium capitalize">
                        {product.artisanalIdentity.primaryTechnique.name}
                      </p>
                    </div>
                  )}

                  {product.artisanalIdentity?.pieceType && (
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">
                        Tipo de Pieza
                      </p>
                      <p className="font-medium capitalize">
                        {product.artisanalIdentity.pieceType}
                      </p>
                    </div>
                  )}

                  {product.artisanalIdentity?.style && (
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">
                        Estilo
                      </p>
                      <p className="font-medium capitalize">
                        {product.artisanalIdentity.style}
                      </p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Physical Details - Collapsible */}
            {product.physicalSpecs && (
              <Card>
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleSection("physical")}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Ruler className="w-5 h-5" />
                      Detalles Físicos
                    </CardTitle>
                    {expandedSections.physical ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </CardHeader>
                {expandedSections.physical && (
                  <CardContent className="space-y-4 border-t">
                    {(product.physicalSpecs.width ||
                      product.physicalSpecs.height ||
                      product.physicalSpecs.depth) && (
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-3">
                          Dimensiones
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {product.physicalSpecs.width && (
                            <div className="text-center p-3 bg-background rounded-md">
                              <p className="text-2xl font-bold text-primary">
                                {product.physicalSpecs.width}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Ancho (cm)
                              </p>
                            </div>
                          )}
                          {product.physicalSpecs.height && (
                            <div className="text-center p-3 bg-background rounded-md">
                              <p className="text-2xl font-bold text-primary">
                                {product.physicalSpecs.height}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Alto (cm)
                              </p>
                            </div>
                          )}
                          {product.physicalSpecs.depth && (
                            <div className="text-center p-3 bg-background rounded-md">
                              <p className="text-2xl font-bold text-primary">
                                {product.physicalSpecs.depth}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Profundidad (cm)
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {product.physicalSpecs.weight && (
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">
                          Peso
                        </p>
                        <div className="flex items-center gap-3">
                          <Scale className="w-6 h-6 text-primary" />
                          <p className="text-2xl font-bold">
                            {product.physicalSpecs.weight} kg
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )}

            {/* Materials - Collapsible */}
            {product.materials && product.materials.length > 0 && (
              <Card>
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleSection("materials")}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Materiales
                    </CardTitle>
                    {expandedSections.materials ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </CardHeader>
                {expandedSections.materials && (
                  <CardContent className="border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      {product.materials.map((materialLink, index) => (
                        <div
                          key={index}
                          className="bg-muted/30 p-4 rounded-lg border-l-4 border-primary"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold">
                                {materialLink.material?.name || "Material"}
                              </p>
                              {materialLink.materialOrigin && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Origen: {materialLink.materialOrigin}
                                </p>
                              )}
                            </div>
                            {materialLink.isPrimary && (
                              <Badge variant="secondary" className="ml-2">
                                Principal
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            )}
          </div>

          {/* Right Column - Validation Seal (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">
                        Sello de Validación TELAR
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Este producto ha sido registrado y verificado en nuestra
                        plataforma. Garantizamos la autenticidad de la
                        información presentada.
                      </p>
                    </div>
                    <Separator />
                    <div className="w-full text-left space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          ID del Pasaporte
                        </p>
                        <p className="font-mono text-sm font-medium">
                          {passportId}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Fecha de Consulta
                        </p>
                        <p className="text-sm">
                          {new Date().toLocaleDateString("es-CO", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Update Information Button & Modal */}
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={handleOpenModal}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Actualizar Información de Pasaporte
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      Actualizar informacion de notificación del pasaporte
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="nombreCompleto">Nombre Completo</Label>
                      <Input
                        id="nombreCompleto"
                        value={formData.nombreCompleto}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nombreCompleto: e.target.value,
                          })
                        }
                        placeholder="Ingresa tu nombre completo"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="celular">Celular</Label>
                      <Input
                        id="celular"
                        type="tel"
                        value={formData.celular}
                        onChange={(e) =>
                          setFormData({ ...formData, celular: e.target.value })
                        }
                        placeholder="3001234567"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSubmitUpdate}
                      disabled={isSubmitting}
                    >
                      {isSubmitting && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      Guardar Cambios
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-8">
          <p>Pasaporte Digital generado por TELAR</p>
        </div>
      </div>
    </div>
  );
};
