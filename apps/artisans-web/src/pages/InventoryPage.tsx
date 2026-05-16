import React, { useState, useEffect, useRef } from "react";
import { formatCurrency } from "@/utils/currency";
import { useNavigate } from "react-router-dom";
import { useInventory } from "@/hooks/useInventory";
import { useArtisanShop } from "@/hooks/useArtisanShop";
import { useMasterAgent } from "@/context/MasterAgentContext";
import { EventBus } from "@/utils/eventBus";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Search,
  Edit,
  Package,
  Trash2,
  ShoppingBag,
  LayoutGrid,
  FileEdit,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MarketplaceLinksManager } from "@/components/inventory/MarketplaceLinksManager";
import { DeleteProductDialog } from "@/components/inventory/DeleteProductDialog";
import { ModerationFeedbackBadge } from "@/components/inventory/ModerationFeedbackBadge";
import { QuickStockModal } from "@/components/inventory/QuickStockModal";
import { StockDashboardPanel } from "@/components/inventory/StockDashboardPanel";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { InventoryBulkActions } from "@/components/inventory/InventoryBulkActions";
import { InventoryAIPanel } from "@/components/inventory/InventoryAIPanel";
import { getModerationCommentsForProducts } from "@/services/productModerationHistory.actions";
import { LegacyProduct } from "@telar/shared-types";

// ── Telar Design System ───────────────────────────────────────────────────────
const SERIF = "'Noto Serif', serif";
const SANS  = "'Manrope', sans-serif";

const glassPrimary: React.CSSProperties = {
  background:           'rgba(255,255,255,0.82)',
  backdropFilter:       'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border:               '1px solid rgba(255,255,255,0.65)',
  boxShadow:            '0 4px 20px rgba(21,27,45,0.02)',
};

export const InventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { shop } = useArtisanShop();
  const { refreshModule } = useMasterAgent();
  const {
    loading,
    fetchProducts,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
    duplicateProduct,
    adjustProductStock,
  } = useInventory();

  const [products, setProducts] = useState<LegacyProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [marketplaceModalOpen, setMarketplaceModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<LegacyProduct | null>(null);
  const [productToDelete, setProductToDelete] = useState<LegacyProduct | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [quickStockModalOpen, setQuickStockModalOpen] = useState(false);
  const [moderationComments, setModerationComments] = useState<Record<string, string>>({});

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);

  const selectAllRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const loadProducts = async () => {
      if (shop?.id) {
        const data = await fetchProducts(shop.id);
        setProducts(data);
      }
    };
    loadProducts();
  }, [shop?.id]);

  useEffect(() => {
    const fetchModerationComments = async () => {
      const productsNeedingComments = products.filter(
        (p) =>
          p.moderation_status === "rejected" ||
          p.moderation_status === "changes_requested",
      );
      if (productsNeedingComments.length === 0) {
        setModerationComments({});
        return;
      }
      const productIds = productsNeedingComments.map((p) => p.id);
      const commentsMap = await getModerationCommentsForProducts(productIds);
      setModerationComments(commentsMap);
    };
    if (products.length > 0) fetchModerationComments();
  }, [products]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && product.active) ||
      (statusFilter === "inactive" && !product.active) ||
      (statusFilter === "draft" && product.moderation_status === "draft");
    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && product.inventory !== null && product.inventory <= 5) ||
      (stockFilter === "out" && product.inventory === 0) ||
      (stockFilter === "in-stock" && product.inventory !== null && product.inventory > 0);
    return matchesSearch && matchesStatus && matchesStock;
  });

  // ── Selection helpers ──────────────────────────────────────────────────────
  const allFilteredSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedIds.has(p.id));
  const someFilteredSelected =
    filteredProducts.some((p) => selectedIds.has(p.id)) && !allFilteredSelected;

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredProducts.forEach((p) => next.delete(p.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredProducts.forEach((p) => next.add(p.id));
        return next;
      });
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Individual actions (optimistic) ───────────────────────────────────────
  const handleToggleActive = async (productId: string, currentActive: boolean) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, active: !currentActive } : p))
    );
    try {
      await updateProduct(productId, { active: !currentActive });
      EventBus.publish("inventory.updated", { productId, active: !currentActive });
    } catch {
      // revert on error
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, active: currentActive } : p))
      );
    }
  };

  const handleEdit = (productId: string) => {
    navigate(`/productos/subir?edit=true&productId=${productId}`);
  };

  const handleOpenMarketplaces = (product: LegacyProduct) => {
    setSelectedProduct(product);
    setMarketplaceModalOpen(true);
  };

  const handleSaveMarketplaceLinks = async (links: any) => {
    if (!selectedProduct) return;
    await updateProduct(selectedProduct.id, { marketplace_links: links });
    setProducts((prev) =>
      prev.map((p) => (p.id === selectedProduct.id ? { ...p, marketplace_links: links } : p))
    );
    EventBus.publish("inventory.updated", { productId: selectedProduct.id, marketplaceLinks: links });
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeleteLoading(true);
    try {
      const success = await deleteProduct(productToDelete.id);
      if (success) {
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(productToDelete.id);
          return next;
        });
        EventBus.publish("inventory.updated", { productId: productToDelete.id, deleted: true });
        setProductToDelete(null);
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleQuickStockSave = async (
    productId: string,
    change: number,
    channel: string,
    notes: string,
  ) => {
    const success = await adjustProductStock(productId, change, channel, notes);
    if (success) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, inventory: Math.max(0, (p.inventory ?? 0) + change) }
            : p
        )
      );
      EventBus.publish("inventory.updated", { productId });
    }
  };

  const handleDuplicateProduct = async (product: LegacyProduct) => {
    const newProduct = await duplicateProduct(product.id);
    if (newProduct && shop) {
      const data = await fetchProducts(shop.id);
      setProducts(data);
      EventBus.publish("inventory.updated", { productId: newProduct.id, duplicated: true });
      navigate(`/productos/editar/${newProduct.id}`);
    }
  };

  // ── Bulk actions ───────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    const ids = [...selectedIds];
    setBulkProcessing(true);
    setBulkProgress(0);
    try {
      await bulkDeleteProducts(ids);
      setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
      setSelectedIds(new Set());
      EventBus.publish("inventory.updated", { bulkDeleted: ids });
    } finally {
      setBulkProcessing(false);
      setBulkProgress(0);
    }
  };

  const handleBulkActivate = async () => {
    const ids = [...selectedIds];
    setBulkProcessing(true);
    setBulkProgress(0);
    try {
      await Promise.all(
        ids.map(async (id, i) => {
          await updateProduct(id, { active: true });
          setBulkProgress(Math.round(((i + 1) / ids.length) * 100));
        })
      );
      setProducts((prev) =>
        prev.map((p) => (ids.includes(p.id) ? { ...p, active: true } : p))
      );
      setSelectedIds(new Set());
    } finally {
      setBulkProcessing(false);
      setBulkProgress(0);
    }
  };

  const handleBulkDeactivate = async () => {
    const ids = [...selectedIds];
    setBulkProcessing(true);
    setBulkProgress(0);
    try {
      await Promise.all(
        ids.map(async (id, i) => {
          await updateProduct(id, { active: false });
          setBulkProgress(Math.round(((i + 1) / ids.length) * 100));
        })
      );
      setProducts((prev) =>
        prev.map((p) => (ids.includes(p.id) ? { ...p, active: false } : p))
      );
      setSelectedIds(new Set());
    } finally {
      setBulkProcessing(false);
      setBulkProgress(0);
    }
  };

  const getStockBadge = (inventory: number | null) => {
    const stockLevel = inventory ?? 0;
    return (
      <div
        className={`w-3 h-3 rounded-full ${
          stockLevel === 0 || stockLevel === 1
            ? "bg-red-500"
            : stockLevel > 1 && stockLevel < 4
              ? "bg-yellow-500"
              : "bg-green-500"
        }`}
        title={
          stockLevel === 0
            ? "Sin stock"
            : stockLevel === 1
              ? "Stock crítico: 1 unidad"
              : stockLevel < 4
                ? `Bajo stock: ${stockLevel} unidades`
                : `En stock: ${stockLevel} unidades`
        }
      />
    );
  };

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">No tienes una tienda</h2>
          <p className="text-muted-foreground mb-4">
            Crea una tienda para gestionar tu inventario
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:opacity-90 mx-auto"
            style={{ background: '#ec6d13', color: 'white', fontFamily: SANS, fontSize: 13, fontWeight: 700, boxShadow: '0 4px 12px rgba(236,109,19,0.3)', border: 'none', cursor: 'pointer' }}
          >
            Ir al Taller Digital
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden">
      {/* Header */}
      <header
        className="sticky top-0 z-30 px-12 pt-4 pb-3 grid items-center"
        style={{ gridTemplateColumns: '1fr auto 1fr' }}
      >
        <div className="flex items-center gap-3">
          {shop?.logoUrl && (
            <img src={shop.logoUrl} alt={shop.shopName} className="h-10 w-10 rounded-full object-contain"
              style={{ border: '1px solid rgba(21,27,45,0.08)', background: 'white', padding: 2 }} />
          )}
        </div>
        <div className="flex flex-col items-center text-center">
          <h1 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: '#151b2d', lineHeight: 1.2 }}>
            Inventario
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, color: 'rgba(84,67,62,0.7)', marginTop: 2 }}>
            Gestiona todos tus productos desde aquí
          </p>
        </div>
        <div className="flex items-center gap-3 justify-end">
          <NotificationCenter />
          <button
            onClick={() => navigate("/stock-wizard")}
            className="flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:bg-black/5"
            style={{ border: '1px solid rgba(21,27,45,0.1)', color: '#151b2d', fontFamily: SANS, fontSize: 13, fontWeight: 700, background: 'transparent', cursor: 'pointer' }}
          >
            <LayoutGrid className="w-4 h-4" />
            Stock
          </button>
          <button
            onClick={() => navigate("/productos/subir")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: '#ec6d13', color: 'white', fontFamily: SANS, fontSize: 13, fontWeight: 700, boxShadow: '0 4px 12px rgba(236,109,19,0.3)', border: 'none', cursor: 'pointer' }}
          >
            <Plus className="w-4 h-4" />
            Añadir Producto
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="px-12 pb-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
            <SelectItem value="draft">Borradores</SelectItem>
          </SelectContent>
        </Select>

        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="in-stock">En stock</SelectItem>
            <SelectItem value="low">Bajo stock</SelectItem>
            <SelectItem value="out">Sin stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main table area */}
          <div className="flex-1 min-w-0">
            {/* Stock Dashboard Panel */}
            {!loading && products.length > 0 && (
              <div className="mb-5">
                <StockDashboardPanel products={products} />
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No hay productos</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== "all" || stockFilter !== "all"
                    ? "No se encontraron productos con los filtros aplicados"
                    : "Comienza añadiendo tu primer producto"}
                </p>
                {!searchQuery && statusFilter === "all" && stockFilter === "all" && (
                  <button
                    onClick={() => navigate("/productos/subir")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:opacity-90 mx-auto"
                    style={{ background: '#ec6d13', color: 'white', fontFamily: SANS, fontSize: 13, fontWeight: 700, boxShadow: '0 4px 12px rgba(236,109,19,0.3)', border: 'none', cursor: 'pointer' }}
                  >
                    <Plus className="w-4 h-4" />
                    Añadir Primer Producto
                  </button>
                )}
              </div>
            ) : (
              <div style={{ ...glassPrimary, borderRadius: 16, overflow: 'hidden' }}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10 pl-4">
                        <Checkbox
                          checked={allFilteredSelected}
                          ref={selectAllRef as any}
                          data-state={someFilteredSelected ? "indeterminate" : undefined}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Seleccionar todos"
                          className="translate-y-[1px]"
                        />
                      </TableHead>
                      <TableHead className="text-center">Imagen</TableHead>
                      <TableHead className="text-center">Producto</TableHead>
                      <TableHead className="text-center">Categoría</TableHead>
                      <TableHead className="text-center">Precio</TableHead>
                      <TableHead className="text-center">Stock</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const images = Array.isArray(product.images) ? product.images : [];
                      const firstImage = images[0] || "/placeholder.svg";
                      const isSelected = selectedIds.has(product.id);

                      return (
                        <TableRow
                          key={product.id}
                          data-selected={isSelected}
                          className={isSelected ? "bg-orange-50/50" : undefined}
                        >
                          <TableCell className="pl-4">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelectOne(product.id)}
                              aria-label={`Seleccionar ${product.name}`}
                              className="translate-y-[1px]"
                            />
                          </TableCell>
                          <TableCell>
                            <img
                              src={firstImage}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium" style={{ fontFamily: SANS }}>{product.name}</div>
                              {product.sku && (
                                <div className="text-xs text-muted-foreground">
                                  SKU: {product.sku}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell style={{ fontFamily: SANS }}>{product.category || "-"}</TableCell>
                          <TableCell style={{ fontFamily: SANS }}>
                            {product.price ? formatCurrency(product.price) : "Sin precio"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm" style={{ fontFamily: SANS }}>{product.inventory ?? 0}</span>
                              {getStockBadge(product.inventory)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {product.moderation_status ? (
                                <ModerationFeedbackBadge
                                  status={product.moderation_status}
                                  comment={moderationComments[product.id]}
                                  productId={product.id}
                                  productName={product.name}
                                />
                              ) : product.active ? (
                                <Badge variant="default">Activo</Badge>
                              ) : (
                                <Badge variant="secondary">Inactivo</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {product.moderation_status === "draft" ? (
                                <button
                                  onClick={() => handleEdit(product.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:opacity-90"
                                  style={{ background: '#ec6d13', color: 'white', fontFamily: SANS, border: 'none', cursor: 'pointer' }}
                                >
                                  <FileEdit className="w-3 h-3" />
                                  Completar
                                </button>
                              ) : (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => handleEdit(product.id)}
                                        className="p-2 rounded-lg hover:bg-black/5 transition-colors"
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#151b2d' }}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Editar</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => setProductToDelete(product)}
                                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>Eliminar</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {!loading && filteredProducts.length > 0 && (
              <div className="mt-4 text-sm text-center" style={{ fontFamily: SANS, color: 'rgba(84,67,62,0.45)' }}>
                {selectedIds.size > 0
                  ? `${selectedIds.size} seleccionado${selectedIds.size > 1 ? 's' : ''} · `
                  : ''}
                Mostrando {filteredProducts.length} de {products.length} productos
              </div>
            )}
          </div>

          {/* AI Panel — sidebar (desktop only) */}
          {!loading && products.length > 0 && (
            <div className="hidden lg:block w-72 shrink-0">
              <div style={{ position: 'sticky', top: 24 }}>
                <InventoryAIPanel products={products} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedProduct && (
        <MarketplaceLinksManager
          open={marketplaceModalOpen}
          onOpenChange={setMarketplaceModalOpen}
          productName={selectedProduct.name}
          initialLinks={{}}
          onSave={handleSaveMarketplaceLinks}
        />
      )}

      <DeleteProductDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
        productName={productToDelete?.name || ""}
        onConfirm={handleDeleteProduct}
        loading={deleteLoading}
      />

      <QuickStockModal
        open={quickStockModalOpen}
        onOpenChange={setQuickStockModalOpen}
        products={products}
        onSave={handleQuickStockSave}
      />

      {/* Bulk actions bar */}
      <InventoryBulkActions
        selectedCount={selectedIds.size}
        onDeleteAll={handleBulkDelete}
        onActivateAll={handleBulkActivate}
        onDeactivateAll={handleBulkDeactivate}
        onClearSelection={() => setSelectedIds(new Set())}
        isProcessing={bulkProcessing}
        progress={bulkProgress}
      />

      {/* FAB: quick stock */}
      <button
        onClick={() => setQuickStockModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center z-50"
        style={{ background: '#ec6d13', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(236,109,19,0.4)' }}
        aria-label="Registrar venta rápida"
      >
        <ShoppingBag className="w-6 h-6" />
      </button>
      </div>
    </div>
  );
};

export default InventoryPage;
