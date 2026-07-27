import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle,
  Shield,
  AlertCircle,
  Package,
  UserCheck,
} from "lucide-react";
import { registerUserPassportWithKey } from "@/services/users-passport.actions";
import { getProductIdentityByKey } from "@/services/product-identity.actions";
import { toast } from "sonner";

export const CertificateRegistrationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const identityKey = searchParams.get("key");

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [certificateExists, setCertificateExists] = useState(false);

  const [formData, setFormData] = useState({
    numIdentificacion: "",
    nombreCompleto: "",
    email: "",
    telefono: "",
  });

  const [formErrors, setFormErrors] = useState({
    numIdentificacion: "",
    nombreCompleto: "",
    email: "",
    telefono: "",
  });

  // Verificar que el certificado existe y es válido
  useEffect(() => {
    const verifyCertificate = async () => {
      if (!identityKey) {
        setError("No se proporcionó una clave de certificado válida");
        setVerifying(false);
        setLoading(false);
        return;
      }

      try {
        setVerifying(true);
        // Verificar que existe el certificado
        await getProductIdentityByKey(identityKey);
        setCertificateExists(true);
        setError(null);
      } catch (err: any) {
        console.error("Error verifying certificate:", err);
        setError(
          err.message || "El certificado no existe o no es válido"
        );
        setCertificateExists(false);
      } finally {
        setVerifying(false);
        setLoading(false);
      }
    };

    verifyCertificate();
  }, [identityKey]);

  const validateForm = (): boolean => {
    const errors = {
      numIdentificacion: "",
      nombreCompleto: "",
      email: "",
      telefono: "",
    };

    let isValid = true;

    // Validar número de identificación
    if (!formData.numIdentificacion.trim()) {
      errors.numIdentificacion = "El número de identificación es obligatorio";
      isValid = false;
    }

    // Validar nombre completo
    if (!formData.nombreCompleto.trim()) {
      errors.nombreCompleto = "El nombre completo es obligatorio";
      isValid = false;
    } else if (formData.nombreCompleto.trim().length < 3) {
      errors.nombreCompleto = "El nombre debe tener al menos 3 caracteres";
      isValid = false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = "El correo electrónico es obligatorio";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "El correo electrónico no es válido";
      isValid = false;
    }

    // Validar teléfono
    if (!formData.telefono.trim()) {
      errors.telefono = "El teléfono es obligatorio";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor, corrige los errores en el formulario");
      return;
    }

    if (!identityKey) {
      toast.error("No se proporcionó una clave de certificado");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await registerUserPassportWithKey({
        identityKey,
        ...formData,
      });

      setSuccess(true);
      toast.success(response.message);

      // Esperar 2 segundos y redirigir
      setTimeout(() => {
        // Aquí puedes redirigir a una página de certificado o perfil
        navigate("/");
      }, 3000);
    } catch (err: any) {
      console.error("Error submitting registration:", err);
      const errorMessage = err.message || "Error al registrar el certificado";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo al editar
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  if (loading || verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">
            Verificando certificado digital...
          </p>
        </div>
      </div>
    );
  }

  if (error && !certificateExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
        <Card className="max-w-md w-full border-destructive/50">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">Certificado no válido</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => navigate("/")} variant="outline">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
        <Card className="max-w-md w-full border-primary/50">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">
              ¡Certificado registrado con éxito! 🎉
            </h2>
            <p className="text-muted-foreground">
              Tu certificado digital ha sido asociado a tu cuenta. Serás
              redirigido en unos momentos...
            </p>
            <div className="pt-4">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Certificado Digital de Autenticidad
          </h1>
          <p className="text-muted-foreground">
            Completa tu información para reclamar tu certificado
          </p>
        </div>

        {/* Certificate Key Display */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Código de Certificado
                  </p>
                  <p className="font-mono font-semibold text-lg">
                    {identityKey}
                  </p>
                </div>
              </div>
              <UserCheck className="w-8 h-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Propietario</CardTitle>
            <CardDescription>
              Estos datos serán asociados permanentemente a tu certificado
              digital
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Número de Identificación */}
              <div className="space-y-2">
                <Label htmlFor="numIdentificacion">
                  Número de Identificación *
                </Label>
                <Input
                  id="numIdentificacion"
                  value={formData.numIdentificacion}
                  onChange={(e) =>
                    handleInputChange("numIdentificacion", e.target.value)
                  }
                  placeholder="1234567890"
                  disabled={submitting}
                  className={formErrors.numIdentificacion ? "border-destructive" : ""}
                />
                {formErrors.numIdentificacion && (
                  <p className="text-sm text-destructive">
                    {formErrors.numIdentificacion}
                  </p>
                )}
              </div>

              {/* Nombre Completo */}
              <div className="space-y-2">
                <Label htmlFor="nombreCompleto">Nombre Completo *</Label>
                <Input
                  id="nombreCompleto"
                  value={formData.nombreCompleto}
                  onChange={(e) =>
                    handleInputChange("nombreCompleto", e.target.value)
                  }
                  placeholder="Juan Pérez García"
                  disabled={submitting}
                  className={formErrors.nombreCompleto ? "border-destructive" : ""}
                />
                {formErrors.nombreCompleto && (
                  <p className="text-sm text-destructive">
                    {formErrors.nombreCompleto}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="correo@ejemplo.com"
                  disabled={submitting}
                  className={formErrors.email ? "border-destructive" : ""}
                />
                {formErrors.email && (
                  <p className="text-sm text-destructive">{formErrors.email}</p>
                )}
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) =>
                    handleInputChange("telefono", e.target.value)
                  }
                  placeholder="+57 300 1234567"
                  disabled={submitting}
                  className={formErrors.telefono ? "border-destructive" : ""}
                />
                {formErrors.telefono && (
                  <p className="text-sm text-destructive">
                    {formErrors.telefono}
                  </p>
                )}
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Info Alert */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Al registrarte, aceptas que tus datos sean asociados de forma
                  permanente a este certificado digital de autenticidad TELAR.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={submitting}
                size="lg"
              >
                {submitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {submitting ? "Registrando..." : "Reclamar Certificado"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-6">
          <p>Certificado Digital TELAR - Autenticidad Garantizada 🇨🇴</p>
        </div>
      </div>
    </div>
  );
};
