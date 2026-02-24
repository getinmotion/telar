import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CreditCard,
  ArrowLeft,
  Shield,
  CheckCircle,
  Building2,
  User,
  FileText,
  Hash,
  Pencil,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBankData } from "@/hooks/useBankData";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EventBus } from "@/utils/eventBus";
import { useAuth } from "@/context/AuthContext";
import { NotificationTemplates } from "@/services/notificationService";
import { BANKS_DATA } from "@/data/cobreBankData";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface CounterpartyData {
  id: string;
  geo: string;
  type: string;
  alias: string;
  metadata: Metadata;
  created_at: Date;
  updated_at: Date;
}

export interface Metadata {
  account_number: string;
  beneficiary_institution: string;
  counterparty_fullname: string;
  counterparty_id_number: string;
  counterparty_id_type: string;
  registered_account: string;
}

export const BankDataPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bankData, loading, saveBankData, updateBankData, paymentToken } = useBankData();

  const [formData, setFormData] = useState({
    holder_name: "",
    document_type: "cc",
    document_number: "",
    bank_code: "",
    account_type: "ch",
    account_number: "",
    country: "Colombia",
    currency: "COP",
  });

  const [saving, setSaving] = useState(false);
  const [counterpartyData, setCounterpartyData] = useState<Metadata | null>(
    null
  );
  const [loadingCounterparty, setLoadingCounterparty] = useState(true);
  const [hasCounterparty, setHasCounterparty] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Check if artisan_shops has id_contraparty and fetch counterparty data
  useEffect(() => {
    const fetchCounterpartyData = async () => {
      if (!user?.id) {
        setLoadingCounterparty(false);
        return;
      }

      try {
        // First check if artisan_shops has id_contraparty
        const { data: shopData, error: shopError } = await supabase
          .from("artisan_shops")
          .select("id_contraparty")
          .eq("user_id", user.id)
          .maybeSingle();

        if (shopError) {
          console.error("Error fetching shop data:", shopError);
          setLoadingCounterparty(false);
          return;
        }

        if (!shopData?.id_contraparty) {
          setHasCounterparty(false);
          setLoadingCounterparty(false);
          return;
        }

        // If id_contraparty exists, call the edge function
        setHasCounterparty(true);

        const { data, error } = await supabase.functions.invoke(
          "get-counterparty",
          {
            body: { counterparty_id: shopData.id_contraparty },
          }
        );

        if (error) {
          console.error("Error fetching counterparty:", error);
          setLoadingCounterparty(false);
          return;
        }

        setCounterpartyData(data.metadata as Metadata);
      } catch (err) {
        console.error("Error in fetchCounterpartyData:", err);
      } finally {
        setLoadingCounterparty(false);
      }
    };

    fetchCounterpartyData();
  }, [user?.id]);

  useEffect(() => {
    if (bankData && !hasCounterparty) {
      setFormData({
        holder_name: bankData.holder_name || "",
        document_type: bankData.document_type || "cc",
        document_number: bankData.document_number || "",
        bank_code: bankData.bank_code || "",
        account_type: bankData.account_type || "ch",
        account_number: bankData.account_number || "",
        country: bankData.country || "Colombia",
        currency: bankData.currency || "COP",
      });
    }
  }, [bankData, hasCounterparty]);

  // Map account type from Cobre API to form values
  const mapAccountType = (type: string | undefined): string => {
    if (!type) return "ch";
    const normalizedType = type.toLowerCase();
    const map: Record<string, string> = {
      'ahorros': 'ch',
      'ch': 'ch',
      'corriente': 'cc',
      'cc': 'cc',
      'r2p': 'r2p',
      'dp': 'dp',
      'breb-key': 'breb-key',
      'r2p_breb': 'r2p_breb',
    };
    return map[normalizedType] || "ch";
  };

  // Pre-fill form when entering edit mode
  useEffect(() => {
    if (isEditing && counterpartyData) {
      // Find bank code from bank name
      const bank = BANKS_DATA.find(
        (b) => b.name === counterpartyData.beneficiary_institution || b.code === counterpartyData.beneficiary_institution
      );
      
      setFormData({
        holder_name: counterpartyData.counterparty_fullname || "",
        document_type: counterpartyData.counterparty_id_type || "cc",
        document_number: counterpartyData.counterparty_id_number || "",
        bank_code: bank?.code || counterpartyData.beneficiary_institution || "",
        account_type: mapAccountType(counterpartyData.registered_account),
        account_number: counterpartyData.account_number || "",
        country: "Colombia",
        currency: "COP",
      });
    }
  }, [isEditing, counterpartyData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If editing, show confirmation dialog first
    if (hasCounterparty && isEditing) {
      setShowConfirmDialog(true);
      return;
    }

    await performSave();
  };

  const performSave = async () => {
    // Validate required fields before saving
    if (!formData.account_type) {
      formData.account_type = "ch"; // Default to savings if somehow empty
    }
    
    setSaving(true);

    let result;
    if (hasCounterparty && isEditing) {
      // Update existing data
      result = await updateBankData({
        ...formData,
        status: "complete",
        geo: "col",
      });
    } else {
      // Create new data
      result = await saveBankData({
        ...formData,
        status: "complete",
        geo: "col",
      });
    }

    setSaving(false);

    if (result.success && result.id_contraparty && user) {
      // Publish event for task completion
      EventBus.publish("bank.data.completed", { userId: user.id });

      // Create notification
      await NotificationTemplates.bankDataConfigured(user.id);

      if (isEditing) {
        // Refresh page to show updated read-only view
        setIsEditing(false);
        setLoadingCounterparty(true);
        // Re-fetch counterparty data
        const { data } = await supabase.functions.invoke("get-counterparty", {
          body: { counterparty_id: result.id_contraparty },
        });
        if (data?.metadata) {
          setCounterpartyData(data.metadata as Metadata);
        }
        setLoadingCounterparty(false);
      } else {
        // Redirect to dashboard for new creation
        navigate("/dashboard");
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      cc: "Cédula de Ciudadanía",
      pa: "Pasaporte",
      nit: "NIT",
      ce: "Cédula de Extranjería",
    };
    return types[type] || type;
  };

  const getAccountTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      ch: "Ahorros",
      cc: "Corriente",
      r2p: "R2P",
      dp: "Depósito electrónico",
      "breb-key": "Llave Bre-b",
      r2p_breb: "Recaudo Bre-b",
    };
    return types[type] || type;
  };

  const getBankName = (code: string) => {
    const bank = BANKS_DATA.find((b) => b.code === code);
    return bank?.name || code;
  };

  if (loading || loadingCounterparty) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <CreditCard className="w-12 h-12 text-muted-foreground" />
        </div>
      </div>
    );
  }

  // publicacion 

  // Display counterparty data as read-only labels if exists (and not editing)
  if (hasCounterparty && counterpartyData && !isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
        <div className="max-w-3xl mx-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Datos Bancarios
                  </h1>
                  <p className="text-muted-foreground">
                    Información registrada para recibir pagos
                  </p>
                </div>
              </div>
            </div>

            <Alert className="mb-6 border-success/20 bg-success/10">
              <CheckCircle className="w-4 h-4 text-success" />
              <AlertDescription className="text-success">
                Tus datos bancarios están completos y listos para recibir pagos
              </AlertDescription>
            </Alert>

            <Card className="p-6">
              <div className="space-y-6">
                <Alert>
                  <Shield className="w-4 h-4" />
                  <AlertDescription>
                    Tus datos bancarios están encriptados y protegidos.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-6">
                  {/* Holder Name */}
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <Label className="text-sm text-muted-foreground">Nombre del Titular</Label>
                      <p className="text-base font-medium text-foreground">
                        {counterpartyData.counterparty_fullname || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Document Info */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <Label className="text-sm text-muted-foreground">Tipo de Documento</Label>
                        <p className="text-base font-medium text-foreground">
                          {getDocumentTypeLabel(counterpartyData.counterparty_id_type || "")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Hash className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <Label className="text-sm text-muted-foreground">Número de Documento</Label>
                        <p className="text-base font-medium text-foreground">
                          {counterpartyData.counterparty_id_number || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bank Info */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <Label className="text-sm text-muted-foreground">Banco</Label>
                        <p className="text-base font-medium text-foreground">
                          {counterpartyData.beneficiary_institution || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <Label className="text-sm text-muted-foreground">Número de Cuenta</Label>
                        <p className="text-base font-medium text-foreground">
                          {counterpartyData.account_number
                            ? `****${counterpartyData.account_number.slice(-4)}`
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="flex-1"
                  >
                    Volver
                  </Button>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="flex-1"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar Datos
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show form for new creation or editing
  const isEditMode = hasCounterparty && isEditing;

  return (
    <>
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar cambios?</AlertDialogTitle>
            <AlertDialogDescription>
              Los datos bancarios anteriores serán reemplazados por los nuevos datos ingresados. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={performSave}>
              Confirmar cambios
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
        <div className="max-w-3xl mx-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button 
              variant="ghost" 
              onClick={isEditMode ? handleCancelEdit : () => navigate(-1)} 
              className="mb-6"
            >
              {isEditMode ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar edición
                </>
              ) : (
                <>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </>
              )}
            </Button>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {isEditMode ? "Editar Datos Bancarios" : "Datos Bancarios"}
                  </h1>
                  <p className="text-muted-foreground">
                    {isEditMode 
                      ? "Actualiza tu información bancaria" 
                      : "Para recibir los pagos de tus ventas"}
                  </p>
                </div>
              </div>
            </div>

            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Alert>
                  <Shield className="w-4 h-4" />
                  <AlertDescription>
                    Tus datos bancarios están encriptados y protegidos. Solo se
                    usarán para procesar tus pagos.
                  </AlertDescription>
                </Alert>

                {isEditMode && (
                  <Alert className="border-warning/20 bg-warning/10">
                    <FileText className="w-4 h-4 text-warning" />
                    <AlertDescription className="text-warning">
                      <strong>Importante:</strong> Se crearán nuevos datos bancarios que reemplazarán los actuales.
                    </AlertDescription>
                  </Alert>
                )}

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="holder_name">Nombre del Titular *</Label>
                  <Input
                    id="holder_name"
                    value={formData.holder_name}
                    onChange={(e) =>
                      handleChange("holder_name", e.target.value)
                    }
                    placeholder="Nombre completo como aparece en la cuenta"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document_type">Tipo de Documento *</Label>
                  <Select
                    value={formData.document_type}
                    onValueChange={(value) =>
                      handleChange("document_type", value)
                    }
                  >
                    <SelectTrigger id="document_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cc">Cédula de Ciudadanía</SelectItem>
                      <SelectItem value="pa">Pasaporte</SelectItem>
                      <SelectItem value="nit">NIT</SelectItem>
                      <SelectItem value="ce">Cédula de Extranjería</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document_number">Número de Documento *</Label>
                  <Input
                    id="document_number"
                    value={formData.document_number}
                    onChange={(e) =>
                      handleChange("document_number", e.target.value)
                    }
                    placeholder="Ej: 1234567890"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account_type">Tipo de Cuenta *</Label>
                  <Select
                    value={formData.account_type}
                    onValueChange={(value) =>
                      handleChange("account_type", value)
                    }
                  >
                    <SelectTrigger id="account_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ch">Ahorros</SelectItem>
                      <SelectItem value="cc">Corriente</SelectItem>
                      <SelectItem value="r2p">R2P</SelectItem>
                      <SelectItem value="dp">Deposito electronico</SelectItem>
                      <SelectItem value="breb-key">Llave Bre-b</SelectItem>
                      <SelectItem value="r2p_breb">Recaudo Bre-b</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank_name">Banco *</Label>
                  <Select
                    value={formData.bank_code}
                    onValueChange={(bankName) =>
                      handleChange("bank_code", bankName)
                    }
                  >
                    <SelectTrigger id="bank_code">
                      <SelectValue placeholder="Selecciona tu banco" />
                    </SelectTrigger>
                    <SelectContent>
                      {BANKS_DATA.map((bank) => (
                        <SelectItem key={bank.code} value={bank.code}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="account_number">
                    {formData.account_type === "breb-key" || formData.account_type === "r2p_breb" 
                      ? "Llave Bre-b *" 
                      : "Número de Cuenta *"}
                  </Label>
                  <Input
                    id="account_number"
                    value={formData.account_number}
                    onChange={(e) => {
                      const isBreBType = formData.account_type === "breb-key" || formData.account_type === "r2p_breb";
                      const value = isBreBType 
                        ? e.target.value // Permite alfanumérico y @ para Bre-b
                        : e.target.value.replace(/\D/g, ""); // Solo números para otros tipos
                      handleChange("account_number", value);
                    }}
                    placeholder={
                      formData.account_type === "breb-key" || formData.account_type === "r2p_breb"
                        ? "Ej: @tunombre o llave Bre-b"
                        : "Solo números"
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <Input
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => handleChange("currency", e.target.value)}
                    disabled
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? "Guardando..." : "Guardar Datos Bancarios"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default BankDataPage;
