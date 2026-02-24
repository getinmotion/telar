import { useState, useEffect, useCallback } from "react";
import { usePromotions } from "@/hooks/usePromotions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Ban, Percent, DollarSign, RefreshCw, Power, AlertTriangle } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  type: "percent" | "fixed_amount";
  value: number;
  description: string | null;
  is_public: boolean;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  min_order_amount: number | null;
  max_discount_amount: number | null;
  usage_limit_total: number | null;
  usage_limit_per_user: number | null;
  times_used: number;
  conditions_json: Record<string, unknown>;
  created_at: string;
}

const defaultCoupon: Partial<Coupon> = {
  code: "",
  type: "percent",
  value: 10,
  description: "",
  is_public: false,
  min_order_amount: null,
  max_discount_amount: null,
  usage_limit_total: null,
  usage_limit_per_user: null,
  conditions_json: {},
};

export function CouponManagement() {
  const { loading, listCoupons, createCoupon, updateCoupon, deactivateCoupon } = usePromotions();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
  const [formData, setFormData] = useState<Partial<Coupon>>(defaultCoupon);
  const [initialFormData, setInitialFormData] = useState<Partial<Coupon>>(defaultCoupon);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);

  const loadCoupons = async () => {
    const data = await listCoupons();
    setCoupons(data);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  // Check if form has unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  }, [formData, initialFormData]);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData(defaultCoupon);
    setInitialFormData(defaultCoupon);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData(coupon);
    setInitialFormData(coupon);
    setIsModalOpen(true);
  };

  // Handle modal close with unsaved changes check
  const handleModalOpenChange = (open: boolean) => {
    if (!open && hasUnsavedChanges()) {
      setPendingClose(true);
      setShowDiscardDialog(true);
      return;
    }
    setIsModalOpen(open);
  };

  // Handle cancel button with confirmation
  const handleCancel = () => {
    if (hasUnsavedChanges()) {
      setPendingClose(true);
      setShowDiscardDialog(true);
    } else {
      setIsModalOpen(false);
    }
  };

  // Confirm discard changes
  const handleConfirmDiscard = () => {
    setShowDiscardDialog(false);
    if (pendingClose) {
      setIsModalOpen(false);
      setPendingClose(false);
    }
  };

  // Cancel discard
  const handleCancelDiscard = () => {
    setShowDiscardDialog(false);
    setPendingClose(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCoupon?.id) {
      const success = await updateCoupon(editingCoupon.id, formData);
      if (success) {
        setIsModalOpen(false);
        loadCoupons();
      }
    } else {
      const result = await createCoupon(formData);
      if (result) {
        setIsModalOpen(false);
        loadCoupons();
      }
    }
  };

  const handleDeactivate = async (id: string) => {
    if (confirm("¿Desactivar este cupón?")) {
      const success = await deactivateCoupon(id);
      if (success) loadCoupons();
    }
  };

  const handleReactivate = async (coupon: Coupon) => {
    const success = await updateCoupon(coupon.id, { is_active: true });
    if (success) loadCoupons();
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("es-CO");
  };

  return (
    <div className="space-y-6">
      {/* Discard Changes Dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Cambios sin guardar
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tienes cambios sin guardar. ¿Estás seguro de que quieres descartarlos?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDiscard}>
              Seguir editando
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDiscard}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Descartar cambios
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Cupones de Descuento</h2>
          <p className="text-muted-foreground">Gestiona los cupones promocionales</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadCoupons} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Cupón
              </Button>
            </DialogTrigger>
            <DialogContent 
              className="max-w-2xl max-h-[90vh] overflow-y-auto"
              onPointerDownOutside={(e) => {
                if (hasUnsavedChanges()) {
                  e.preventDefault();
                  setPendingClose(true);
                  setShowDiscardDialog(true);
                }
              }}
              onEscapeKeyDown={(e) => {
                if (hasUnsavedChanges()) {
                  e.preventDefault();
                  setPendingClose(true);
                  setShowDiscardDialog(true);
                }
              }}
              onInteractOutside={(e) => {
                if (hasUnsavedChanges()) {
                  e.preventDefault();
                }
              }}
            >
              <DialogHeader>
                <DialogTitle>
                  {editingCoupon ? "Editar Cupón" : "Crear Nuevo Cupón"}
                </DialogTitle>
                <DialogDescription>
                  {editingCoupon 
                    ? "Modifica los detalles del cupón existente" 
                    : "Completa los campos para crear un nuevo cupón de descuento"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Código *</Label>
                    <Input
                      value={formData.code || ""}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="DESCUENTO10"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(v) => setFormData({ ...formData, type: v as "percent" | "fixed_amount" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">Porcentaje (%)</SelectItem>
                        <SelectItem value="fixed_amount">Monto Fijo ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valor *</Label>
                    <Input
                      type="number"
                      value={formData.value || ""}
                      onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                      placeholder={formData.type === "percent" ? "10" : "20000"}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descuento Máximo</Label>
                    <Input
                      type="number"
                      value={formData.max_discount_amount || ""}
                      onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value ? Number(e.target.value) : null })}
                      placeholder="50000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción interna del cupón"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha Inicio</Label>
                    <Input
                      type="datetime-local"
                      value={formData.start_date?.slice(0, 16) || ""}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha Fin</Label>
                    <Input
                      type="datetime-local"
                      value={formData.end_date?.slice(0, 16) || ""}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Monto Mínimo de Orden</Label>
                    <Input
                      type="number"
                      value={formData.min_order_amount || ""}
                      onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value ? Number(e.target.value) : null })}
                      placeholder="100000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Límite Total de Usos</Label>
                    <Input
                      type="number"
                      value={formData.usage_limit_total || ""}
                      onChange={(e) => setFormData({ ...formData, usage_limit_total: e.target.value ? Number(e.target.value) : null })}
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Límite por Usuario</Label>
                    <Input
                      type="number"
                      value={formData.usage_limit_per_user || ""}
                      onChange={(e) => setFormData({ ...formData, usage_limit_per_user: e.target.value ? Number(e.target.value) : null })}
                      placeholder="1"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      checked={formData.is_public || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                    />
                    <Label>Cupón Público</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Condiciones Especiales</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={(formData.conditions_json as Record<string, unknown>)?.primera_compra === true}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        conditions_json: { ...formData.conditions_json, primera_compra: checked }
                      })}
                    />
                    <Label className="text-sm">Solo primera compra</Label>
                  </div>
                </div>

                {/* Unsaved changes indicator */}
                {hasUnsavedChanges() && (
                  <div className="flex items-center gap-2 p-2 bg-warning/10 border border-warning/30 rounded-lg text-sm text-warning">
                    <AlertTriangle className="h-4 w-4" />
                    Tienes cambios sin guardar
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {editingCoupon ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vigencia</TableHead>
              <TableHead>Usos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No hay cupones creados
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                  <TableCell>
                    {coupon.type === "percent" ? (
                      <Badge variant="secondary"><Percent className="h-3 w-3 mr-1" />Porcentaje</Badge>
                    ) : (
                      <Badge variant="outline"><DollarSign className="h-3 w-3 mr-1" />Fijo</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {coupon.type === "percent" ? `${coupon.value}%` : `$${coupon.value.toLocaleString()}`}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(coupon.start_date)} - {formatDate(coupon.end_date)}
                  </TableCell>
                  <TableCell>
                    {coupon.times_used}
                    {coupon.usage_limit_total && ` / ${coupon.usage_limit_total}`}
                  </TableCell>
                  <TableCell>
                    {coupon.is_active ? (
                      <Badge className="bg-success text-success-foreground">Activo</Badge>
                    ) : (
                      <Badge variant="destructive">Inactivo</Badge>
                    )}
                    {coupon.is_public && (
                      <Badge variant="outline" className="ml-1">Público</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(coupon)} title="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {coupon.is_active ? (
                        <Button size="sm" variant="ghost" onClick={() => handleDeactivate(coupon.id)} title="Desactivar">
                          <Ban className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => handleReactivate(coupon)} title="Reactivar">
                          <Power className="h-4 w-4 text-success" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
