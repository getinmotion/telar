import React, { useState, useEffect, useRef } from "react";
import { formatCurrency } from "@/utils/currency";
import { useNavigate } from "react-router-dom";
import { useInventory } from "@/hooks/useInventory";
import { useArtisanShop } from "@/hooks/useArtisanShop";
import { useMasterAgent } from "@/context/MasterAgentContext";
import { EventBus } from "@/utils/eventBus";
<<<<<<< HEAD
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
import { useOraculo } from '@/components/oraculo/OraculoContext';
=======
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Edit, Trash2, FileEdit } from "lucide-react";
import { MarketplaceLinksManager } from "@/components/inventory/MarketplaceLinksManager";
import { DeleteProductDialog } from "@/components/inventory/DeleteProductDialog";
import { ModerationFeedbackBadge } from "@/components/inventory/ModerationFeedbackBadge";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { InventoryBulkActions } from "@/components/inventory/InventoryBulkActions";
import { InventoryAIPanel } from "@/components/inventory/InventoryAIPanel";
import { useOraculo } from "@/components/oraculo/OraculoContext";
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
import { getModerationCommentsForProducts } from "@/services/productModerationHistory.actions";
import { LegacyProduct } from "@telar/shared-types";
import logoIcon from "@/assets/logo-icon.svg";

<<<<<<< HEAD
// ── Telar Design System ───────────────────────────────────────────────────────
=======
// ── TELAR Design System ────────────────────────────────────────────────────────
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
const SERIF = "'Noto Serif', serif";
const SANS  = "'Manrope', sans-serif";

const glassPrimary: React.CSSProperties = {
<<<<<<< HEAD
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
=======
  background:           "rgba(255,255,255,0.82)",
  backdropFilter:       "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border:               "1px solid rgba(255,255,255,0.65)",
  boxShadow:            "0 4px 20px rgba(21,27,45,0.02)",
};

// ── Pill ───────────────────────────────────────────────────────────────────────
type PillVariant = "success" | "warning" | "draft" | "error";
const PILL: Record<PillVariant, React.CSSProperties> = {
  success: { background: "rgba(22,101,52,0.1)",  color: "#166534" },
  warning: { background: "rgba(236,109,19,0.1)", color: "#ec6d13" },
  draft:   { background: "rgba(21,27,45,0.06)",  color: "rgba(84,67,62,0.6)" },
  error:   { background: "rgba(239,68,68,0.1)",  color: "#dc2626" },
};
const Pill: React.FC<{ children: React.ReactNode; variant?: PillVariant }> = ({
  children,
  variant = "draft",
}) => (
  <span
    style={{
      ...PILL[variant],
      borderRadius: 9999,
      padding: "2px 10px",
      fontFamily: SANS,
      fontSize: 9,
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      display: "inline-block",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

// ── MetricCard ─────────────────────────────────────────────────────────────────
const MetricCard: React.FC<{
  label: string;
  value: React.ReactNode;
  sub: string;
  icon: string;
  mobileValue?: React.ReactNode;
  mobileIconColor?: string;
}> = ({ label, value, sub, icon, mobileValue, mobileIconColor }) => (
  <>
    <div
      className="md:hidden flex flex-col items-center justify-center gap-1 py-3 px-1 text-center"
      style={{ ...glassPrimary, borderRadius: 14, minHeight: 72 }}
    >
      <span className="material-symbols-outlined" style={{ color: mobileIconColor ?? "rgba(21,27,45,0.22)", fontSize: 20 }}>{icon}</span>
      <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: "#151b2d", lineHeight: 1 }}>
        {mobileValue ?? value}
      </div>
      <span style={{ fontFamily: SANS, fontSize: 7, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(84,67,62,0.45)", lineHeight: 1.3 }}>
        {label}
      </span>
    </div>
    <div style={{ ...glassPrimary, borderRadius: 16 }} className="hidden md:flex px-5 h-16 items-center gap-4">
      <span className="material-symbols-outlined shrink-0" style={{ color: "rgba(21,27,45,0.18)", fontSize: 18 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(84,67,62,0.45)" }}>{label}</span>
        <p style={{ fontFamily: SANS, fontSize: 9, color: "rgba(84,67,62,0.35)", marginTop: 1 }}>{sub}</p>
      </div>
      <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, color: "#151b2d", lineHeight: 1, flexShrink: 0 }}>{value}</div>
    </div>
  </>
);

// ── Page ───────────────────────────────────────────────────────────────────────
export const InventoryPage: React.FC = () => {
  const navigate  = useNavigate();
  const { shop }  = useArtisanShop();
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
  const { setNode, clearNode } = useOraculo();
  const {
    loading,
    fetchProducts,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
    duplicateProduct,
  } = useInventory();

  const [products,           setProducts]           = useState<LegacyProduct[]>([]);
  const [searchQuery,        setSearchQuery]         = useState("");
  const [statusFilter,       setStatusFilter]        = useState("all");
  const [stockFilter,        setStockFilter]         = useState("all");
  const [marketplaceModalOpen, setMarketplaceModalOpen] = useState(false);
<<<<<<< HEAD
  const [selectedProduct, setSelectedProduct] = useState<LegacyProduct | null>(null);
  const [productToDelete, setProductToDelete] = useState<LegacyProduct | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [quickStockModalOpen, setQuickStockModalOpen] = useState(false);
  const [moderationComments, setModerationComments] = useState<Record<string, string>>({});

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
=======
  const [selectedProduct,    setSelectedProduct]     = useState<LegacyProduct | null>(null);
  const [productToDelete,    setProductToDelete]     = useState<LegacyProduct | null>(null);
  const [deleteLoading,      setDeleteLoading]       = useState(false);
  const [moderationComments, setModerationComments]  = useState<Record<string, string>>({});
  const [selectedIds,        setSelectedIds]         = useState<Set<string>>(new Set());
  const [bulkProcessing,     setBulkProcessing]      = useState(false);
  const [bulkProgress,       setBulkProgress]        = useState(0);
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119

  const selectAllRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (shop?.id) fetchProducts(shop.id).then(setProducts);
  }, [shop?.id]);

<<<<<<< HEAD
  useEffect(() => {
    if (!loading) {
      setNode(<InventoryAIPanel products={products} />);
    }
    return clearNode;
  }, [products, loading]);

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
=======
  useEffect(() => {
    if (!loading) setNode(<InventoryAIPanel products={products} />);
    return clearNode;
  }, [products, loading]);

  useEffect(() => {
    const needsComments = products.filter(
      p => p.moderation_status === "rejected" || p.moderation_status === "changes_requested"
    );
    if (!needsComments.length) { setModerationComments({}); return; }
    getModerationCommentsForProducts(needsComments.map(p => p.id)).then(setModerationComments);
  }, [products]);

  // ── Computed stats ─────────────────────────────────────────────────────────
  const totalProducts  = products.length;
  const lowStock       = products.filter(p => p.inventory !== null && p.inventory > 0 && p.inventory <= 5).length;
  const outOfStock     = products.filter(p => (p.inventory ?? 0) === 0).length;
  const inventoryValue = products.reduce((acc, p) => acc + (p.price ?? 0) * (p.inventory ?? 0), 0);

  // ── Filters ────────────────────────────────────────────────────────────────
  const filteredProducts = products.filter(product => {
    const matchSearch  = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus  = statusFilter === "all" ||
                         (statusFilter === "active"   && product.active) ||
                         (statusFilter === "inactive" && !product.active) ||
                         (statusFilter === "draft"    && product.moderation_status === "draft");
    const matchStock   = stockFilter === "all" ||
                         (stockFilter === "in-stock"  && product.inventory !== null && product.inventory > 0) ||
                         (stockFilter === "low"       && product.inventory !== null && product.inventory <= 5) ||
                         (stockFilter === "out"       && (product.inventory ?? 0) === 0);
    return matchSearch && matchStatus && matchStock;
  });

  // ── Selection ──────────────────────────────────────────────────────────────
  const allSelected  = filteredProducts.length > 0 && filteredProducts.every(p => selectedIds.has(p.id));
  const someSelected = filteredProducts.some(p => selectedIds.has(p.id)) && !allSelected;

  const toggleAll = () => setSelectedIds(prev => {
    const next = new Set(prev);
    allSelected ? filteredProducts.forEach(p => next.delete(p.id)) : filteredProducts.forEach(p => next.add(p.id));
    return next;
  });
  const toggleOne = (id: string) => setSelectedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleEdit = (id: string) => navigate(`/productos/subir?edit=true&productId=${id}`);
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119

  const handleSaveMarketplaceLinks = async (links: any) => {
    if (!selectedProduct) return;
    await updateProduct(selectedProduct.id, { marketplace_links: links });
<<<<<<< HEAD
    setProducts((prev) =>
      prev.map((p) => (p.id === selectedProduct.id ? { ...p, marketplace_links: links } : p))
    );
    EventBus.publish("inventory.updated", { productId: selectedProduct.id, marketplaceLinks: links });
=======
    setProducts(prev => prev.map(p => p.id === selectedProduct.id ? { ...p, marketplace_links: links } : p));
    EventBus.publish("inventory.updated", { productId: selectedProduct.id });
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeleteLoading(true);
    try {
<<<<<<< HEAD
      const success = await deleteProduct(productToDelete.id);
      if (success) {
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(productToDelete.id);
          return next;
        });
=======
      if (await deleteProduct(productToDelete.id)) {
        setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
        setSelectedIds(prev => { const n = new Set(prev); n.delete(productToDelete.id); return n; });
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
        EventBus.publish("inventory.updated", { productId: productToDelete.id, deleted: true });
        setProductToDelete(null);
      }
    } finally { setDeleteLoading(false); }
  };

<<<<<<< HEAD
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
=======
  const handleBulkDelete = async () => {
    const ids = [...selectedIds];
    setBulkProcessing(true);
    try {
      await bulkDeleteProducts(ids);
      setProducts(prev => prev.filter(p => !ids.includes(p.id)));
      setSelectedIds(new Set());
      EventBus.publish("inventory.updated", { bulkDeleted: ids });
    } finally { setBulkProcessing(false); setBulkProgress(0); }
  };

  const handleBulkActivate = async () => {
    const ids = [...selectedIds];
    setBulkProcessing(true);
    try {
      await Promise.all(ids.map(async (id, i) => {
        await updateProduct(id, { active: true });
        setBulkProgress(Math.round(((i + 1) / ids.length) * 100));
      }));
      setProducts(prev => prev.map(p => ids.includes(p.id) ? { ...p, active: true } : p));
      setSelectedIds(new Set());
    } finally { setBulkProcessing(false); setBulkProgress(0); }
  };

  const handleBulkDeactivate = async () => {
    const ids = [...selectedIds];
    setBulkProcessing(true);
    try {
      await Promise.all(ids.map(async (id, i) => {
        await updateProduct(id, { active: false });
        setBulkProgress(Math.round(((i + 1) / ids.length) * 100));
      }));
      setProducts(prev => prev.map(p => ids.includes(p.id) ? { ...p, active: false } : p));
      setSelectedIds(new Set());
    } finally { setBulkProcessing(false); setBulkProgress(0); }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const stockDot = (inventory: number | null) => {
    const n = inventory ?? 0;
    const color = n === 0 ? "#ef4444" : n < 4 ? "#eab308" : "#22c55e";
    return <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />;
  };

  const moderationPill = (product: LegacyProduct) => {
    if (product.moderation_status === "draft")    return <Pill variant="draft">Borrador</Pill>;
    if (product.moderation_status === "rejected") return <Pill variant="error">Rechazado</Pill>;
    if (product.moderation_status === "changes_requested") return <Pill variant="warning">Con cambios</Pill>;
    if (product.moderation_status === "pending")  return <Pill variant="warning">En revisión</Pill>;
    if (product.moderation_status === "approved" || product.active) return <Pill variant="success">Activo</Pill>;
    return <Pill variant="draft">Inactivo</Pill>;
  };

  // ── No shop state ──────────────────────────────────────────────────────────
  if (!shop) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center px-6">
        <span className="material-symbols-outlined" style={{ fontSize: 52, color: "rgba(21,27,45,0.12)" }}>inventory_2</span>
        <h2 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: "#151b2d", marginTop: 16, marginBottom: 8 }}>
          No tienes una tienda
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 13, color: "rgba(84,67,62,0.55)", marginBottom: 24 }}>
          Crea una tienda para gestionar tu inventario.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity"
          style={{ background: "#ec6d13", color: "white", fontFamily: SANS, fontSize: 13, fontWeight: 700, boxShadow: "0 4px 12px rgba(236,109,19,0.3)", border: "none", cursor: "pointer" }}
        >
          Ir al Dashboard
        </button>
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
      </div>
    </div>
  );

  // ── Search + filter chips (shared) ─────────────────────────────────────────
  const SearchAndFilters = () => (
    <div className="space-y-2.5">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] pointer-events-none" style={{ color: "rgba(84,67,62,0.35)" }} />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-10 py-2.5 rounded-full text-[13px] focus:outline-none transition-all"
          style={{ ...glassPrimary, fontFamily: SANS, color: "#151b2d", boxShadow: "0 2px 8px rgba(21,27,45,0.04)" }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full"
            style={{ background: "rgba(84,67,62,0.1)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 12, color: "rgba(84,67,62,0.6)" }}>close</span>
          </button>
        )}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
        {([
          { value: "all",      label: "Todos" },
          { value: "active",   label: "Activos" },
          { value: "inactive", label: "Inactivos" },
          { value: "draft",    label: "Borradores" },
        ] as const).map(({ value, label }) => {
          const on = statusFilter === value;
          return (
            <button key={value} onClick={() => setStatusFilter(value)}
              className="shrink-0 px-3 py-1 rounded-full text-[11px] font-[700] transition-all"
              style={{ fontFamily: SANS, background: on ? "#151b2d" : "rgba(255,255,255,0.8)", color: on ? "white" : "rgba(84,67,62,0.55)", border: on ? "none" : "1px solid rgba(226,213,207,0.6)", boxShadow: on ? "0 2px 6px rgba(21,27,45,0.15)" : "none" }}>
              {label}
            </button>
          );
        })}

        <div className="w-px mx-1 self-stretch" style={{ background: "rgba(226,213,207,0.5)" }} />

        {([
          { value: "all",      label: "Todo el stock", dot: "" },
          { value: "in-stock", label: "En stock",      dot: "#22c55e" },
          { value: "low",      label: "Bajo stock",    dot: "#eab308" },
          { value: "out",      label: "Sin stock",     dot: "#ef4444" },
        ] as const).map(({ value, label, dot }) => {
          const on = stockFilter === value;
          return (
            <button key={value} onClick={() => setStockFilter(value)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-[700] transition-all"
              style={{ fontFamily: SANS, background: on ? "#ec6d13" : "rgba(255,255,255,0.8)", color: on ? "white" : "rgba(84,67,62,0.55)", border: on ? "none" : "1px solid rgba(226,213,207,0.6)", boxShadow: on ? "0 2px 6px rgba(236,109,19,0.25)" : "none" }}>
              {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0 }} />}
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── Table column header style ──────────────────────────────────────────────
  const th: React.CSSProperties = {
    fontFamily: SANS, fontSize: 9, fontWeight: 800, letterSpacing: "0.16em",
    textTransform: "uppercase", color: "rgba(84,67,62,0.4)",
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden">
<<<<<<< HEAD
      {/* Header */}
      <header
        className="sticky top-0 z-30 px-4 md:px-12 pt-4 pb-3 flex flex-col md:grid md:items-center gap-2 md:gap-0"
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
      <div className="px-4 md:px-12 pb-3 flex flex-col sm:flex-row gap-3">
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
=======

      {/* ── Header ── */}
      <header className="sticky top-0 z-30">
        {/* Mobile */}
        <div className="md:hidden px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-9 h-9 flex items-center justify-center rounded-full"
            style={{ background: "rgba(21,27,45,0.05)", border: "1px solid rgba(21,27,45,0.07)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#151b2d" }}>arrow_back</span>
          </button>
          <img src={logoIcon} alt="TELAR" className="h-8 w-8 object-contain" />
          <NotificationCenter />
        </div>

        {/* Desktop: 3 columnas */}
        <div className="hidden md:grid px-12 pt-4 pb-3 items-center" style={{ gridTemplateColumns: "1fr auto 1fr" }}>
          <div className="flex items-center gap-3">
            {shop.logoUrl && (
              <img src={shop.logoUrl} alt={shop.shopName} className="h-10 w-10 rounded-full object-contain"
                style={{ border: "1px solid rgba(21,27,45,0.08)", background: "white", padding: 2 }} />
            )}
          </div>
          <div className="flex flex-col items-center text-center">
            <h1 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: "#151b2d", lineHeight: 1.2 }}>Inventario</h1>
            <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, color: "rgba(84,67,62,0.7)", marginTop: 2 }}>
              {totalProducts} producto{totalProducts !== 1 ? "s" : ""} · valor{" "}
              {formatCurrency(inventoryValue)}
            </p>
          </div>
          <div className="flex items-center gap-3 justify-end">
            <NotificationCenter />
            <button
              onClick={() => navigate("/productos/subir")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ background: "#ec6d13", color: "white", fontFamily: SANS, fontSize: 13, fontWeight: 700, boxShadow: "0 4px 12px rgba(236,109,19,0.3)", border: "none", cursor: "pointer" }}
            >
              <Plus className="w-4 h-4" />
              Añadir Producto
            </button>
          </div>
        </div>
      </header>

      {/* ── Scrollable area ── */}
      <div className="flex-1 overflow-y-auto" style={{ overscrollBehavior: "contain" }}>

        {/* ══ MOBILE layout ══════════════════════════════════════════════════ */}
        <div className="md:hidden flex flex-col">

          {/* Metric cards */}
          <div className="grid grid-cols-4 gap-2 mx-3 mt-3 mb-3">
            <MetricCard label="Total" value={totalProducts} mobileValue={totalProducts} sub="productos" icon="inventory_2" mobileIconColor="rgba(21,27,45,0.3)" />
            <MetricCard label="Bajo stock" value={lowStock} mobileValue={lowStock} sub="5 uds o menos" icon="warning" mobileIconColor={lowStock > 0 ? "#eab308" : "rgba(21,27,45,0.2)"} />
            <MetricCard label="Sin stock" value={outOfStock} mobileValue={outOfStock} sub="agotados" icon="remove_shopping_cart" mobileIconColor={outOfStock > 0 ? "#ef4444" : "rgba(21,27,45,0.2)"} />
            <MetricCard label="Valor" value={formatCurrency(inventoryValue)} mobileValue={`$${Math.round(inventoryValue / 1000)}K`} sub="en inventario" icon="monetization_on" mobileIconColor="#ec6d13" />
          </div>

          {/* Search + filters */}
          <div className="px-3 mb-3">
            <SearchAndFilters />
          </div>

          {/* Add product button */}
          <div className="px-3 mb-3">
            <button
              onClick={() => navigate("/productos/subir")}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full transition-all hover:opacity-90"
              style={{ background: "#ec6d13", color: "white", fontFamily: SANS, fontSize: 13, fontWeight: 700, boxShadow: "0 4px 12px rgba(236,109,19,0.25)", border: "none", cursor: "pointer" }}
            >
              <Plus className="w-4 h-4" />
              Añadir Producto
            </button>
          </div>

          {/* Product list */}
          <div className="px-3 pb-28">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: 32, color: "#ec6d13" }}>progress_activity</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12" style={{ ...glassPrimary, borderRadius: 20 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 40, color: "rgba(21,27,45,0.12)" }}>inventory_2</span>
                <p style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: "#151b2d", marginTop: 12, marginBottom: 4 }}>
                  {searchQuery || statusFilter !== "all" || stockFilter !== "all" ? "Sin resultados" : "Sin productos"}
                </p>
                <p style={{ fontFamily: SANS, fontSize: 12, color: "rgba(84,67,62,0.5)" }}>
                  {searchQuery || statusFilter !== "all" || stockFilter !== "all"
                    ? "Prueba con otros filtros"
                    : "Empieza añadiendo tu primera pieza"}
                </p>
              </div>
            ) : (
              <div style={{ ...glassPrimary, borderRadius: 20, overflow: "hidden" }}>
                {filteredProducts.map((product, i) => {
                  const img      = (Array.isArray(product.images) ? product.images : [])[0] || "/placeholder.svg";
                  const isSelected = selectedIds.has(product.id);
                  const inventory  = product.inventory ?? 0;

                  return (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{
                        borderBottom: i < filteredProducts.length - 1 ? "1px solid rgba(21,27,45,0.05)" : "none",
                        background: isSelected ? "rgba(236,109,19,0.04)" : "transparent",
                        transition: "background 0.15s",
                      }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOne(product.id)}
                        aria-label={`Seleccionar ${product.name}`}
                        className="shrink-0"
                      />
                      <img
                        src={img}
                        alt={product.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                        style={{ border: "1px solid rgba(21,27,45,0.07)" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: "#151b2d", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {product.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {stockDot(product.inventory)}
                          <span style={{ fontFamily: SANS, fontSize: 11, color: "rgba(84,67,62,0.55)" }}>
                            {inventory} uds · {product.price ? formatCurrency(product.price) : "Sin precio"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {product.moderation_status ? (
                          <ModerationFeedbackBadge
                            status={product.moderation_status}
                            comment={moderationComments[product.id]}
                            productId={product.id}
                            productName={product.name}
                          />
                        ) : moderationPill(product)}
                        <button
                          onClick={() => handleEdit(product.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 17, color: "#151b2d" }}>
                            {product.moderation_status === "draft" ? "edit_note" : "edit"}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && filteredProducts.length > 0 && (
              <p className="text-center mt-4" style={{ fontFamily: SANS, fontSize: 11, color: "rgba(84,67,62,0.4)" }}>
                {selectedIds.size > 0 ? `${selectedIds.size} seleccionado${selectedIds.size > 1 ? "s" : ""} · ` : ""}
                {filteredProducts.length} de {products.length} productos
              </p>
            )}
          </div>
        </div>

        {/* ══ DESKTOP layout ═════════════════════════════════════════════════ */}
        <div className="hidden md:block px-12 pb-20">
          <div className="max-w-[1300px] mx-auto pt-6">

            {/* 4 metric cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <MetricCard
                label="Total productos" value={totalProducts} sub="en inventario"
                icon="inventory_2" mobileIconColor="rgba(21,27,45,0.3)"
              />
              <MetricCard
                label="Bajo stock" value={lowStock} sub="5 unidades o menos"
                icon="warning" mobileIconColor={lowStock > 0 ? "#eab308" : "rgba(21,27,45,0.2)"}
              />
              <MetricCard
                label="Sin stock" value={outOfStock} sub="agotados"
                icon="remove_shopping_cart" mobileIconColor={outOfStock > 0 ? "#ef4444" : "rgba(21,27,45,0.2)"}
              />
              <MetricCard
                label="Valor inventario" value={formatCurrency(inventoryValue)} sub="precio × unidades"
                icon="monetization_on" mobileIconColor="#ec6d13"
              />
            </div>

            {/* Search + filters */}
            <div className="mb-5">
              <SearchAndFilters />
            </div>

            {/* Main + sidebar */}
            <div className="flex gap-6 items-start">

              {/* Product table */}
              <div className="flex-1 min-w-0">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: 36, color: "#ec6d13" }}>progress_activity</span>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-16" style={{ ...glassPrimary, borderRadius: 20 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 52, color: "rgba(21,27,45,0.1)" }}>inventory_2</span>
                    <p style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: "#151b2d", marginTop: 16, marginBottom: 8 }}>
                      {searchQuery || statusFilter !== "all" || stockFilter !== "all" ? "Sin resultados" : "Sin productos aún"}
                    </p>
                    <p style={{ fontFamily: SANS, fontSize: 13, color: "rgba(84,67,62,0.5)", marginBottom: 24 }}>
                      {searchQuery || statusFilter !== "all" || stockFilter !== "all"
                        ? "Prueba con otros filtros o cambia la búsqueda"
                        : "Empieza añadiendo tu primera pieza artesanal"}
                    </p>
                    {!searchQuery && statusFilter === "all" && stockFilter === "all" && (
                      <button
                        onClick={() => navigate("/productos/subir")}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity"
                        style={{ background: "#ec6d13", color: "white", fontFamily: SANS, fontSize: 13, fontWeight: 700, boxShadow: "0 4px 12px rgba(236,109,19,0.3)", border: "none", cursor: "pointer" }}
                      >
                        <Plus className="w-4 h-4" />
                        Añadir primer producto
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ ...glassPrimary, borderRadius: 20, overflow: "hidden" }}>
                    {/* Table header */}
                    <div
                      className="grid items-center px-5 py-3"
                      style={{
                        gridTemplateColumns: "40px 72px 1fr 140px 110px 90px 110px 72px",
                        gap: 12,
                        borderBottom: "1px solid rgba(21,27,45,0.06)",
                        background: "rgba(21,27,45,0.02)",
                      }}
                    >
                      <Checkbox
                        checked={allSelected}
                        ref={selectAllRef as any}
                        data-state={someSelected ? "indeterminate" : undefined}
                        onCheckedChange={toggleAll}
                        aria-label="Seleccionar todos"
                      />
                      <span style={th}>Foto</span>
                      <span style={th}>Producto</span>
                      <span style={th}>Categoría</span>
                      <span style={th}>Precio</span>
                      <span style={th}>Stock</span>
                      <span style={th}>Estado</span>
                      <span style={th} />
                    </div>

                    {/* Table rows */}
                    {filteredProducts.map((product, i) => {
                      const img        = (Array.isArray(product.images) ? product.images : [])[0] || "/placeholder.svg";
                      const isSelected = selectedIds.has(product.id);
                      const inventory  = product.inventory ?? 0;

                      return (
                        <div
                          key={product.id}
                          className="grid items-center px-5 py-3 transition-colors"
                          style={{
                            gridTemplateColumns: "40px 72px 1fr 140px 110px 90px 110px 72px",
                            gap: 12,
                            borderBottom: i < filteredProducts.length - 1 ? "1px solid rgba(21,27,45,0.04)" : "none",
                            background: isSelected ? "rgba(236,109,19,0.04)" : "transparent",
                          }}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleOne(product.id)}
                            aria-label={`Seleccionar ${product.name}`}
                          />
                          <img
                            src={img}
                            alt={product.name}
                            className="w-14 h-14 rounded-xl object-cover"
                            style={{ border: "1px solid rgba(21,27,45,0.07)" }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: "#151b2d", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {product.name}
                            </p>
                            {product.sku && (
                              <p style={{ fontFamily: SANS, fontSize: 10, color: "rgba(84,67,62,0.4)", marginTop: 1 }}>
                                SKU: {product.sku}
                              </p>
                            )}
                          </div>
                          <p style={{ fontFamily: SANS, fontSize: 12, color: "rgba(84,67,62,0.65)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {product.category || "—"}
                          </p>
                          <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: "#151b2d" }}>
                            {product.price ? formatCurrency(product.price) : <span style={{ color: "rgba(84,67,62,0.3)", fontStyle: "italic" }}>Sin precio</span>}
                          </p>
                          <div className="flex items-center gap-2">
                            {stockDot(product.inventory)}
                            <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: "#151b2d" }}>{inventory}</span>
                          </div>
                          <div>
                            {product.moderation_status ? (
                              <ModerationFeedbackBadge
                                status={product.moderation_status}
                                comment={moderationComments[product.id]}
                                productId={product.id}
                                productName={product.name}
                              />
                            ) : moderationPill(product)}
                          </div>
                          <div className="flex items-center gap-1">
                            {product.moderation_status === "draft" ? (
                              <button
                                onClick={() => handleEdit(product.id)}
                                title="Completar"
                                className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-[800] transition-all hover:opacity-90"
                                style={{ background: "#ec6d13", color: "white", fontFamily: SANS, border: "none", cursor: "pointer" }}
                              >
                                <FileEdit className="w-3 h-3" />
                                Completar
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEdit(product.id)}
                                title="Editar"
                                className="p-2 rounded-xl hover:bg-black/5 transition-colors"
                                style={{ background: "none", border: "none", cursor: "pointer" }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#151b2d" }}>edit</span>
                              </button>
                            )}
                            <button
                              onClick={() => setProductToDelete(product)}
                              title="Eliminar"
                              className="p-2 rounded-xl hover:bg-red-50 transition-colors"
                              style={{ background: "none", border: "none", cursor: "pointer" }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#ef4444" }}>delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {!loading && filteredProducts.length > 0 && (
                  <p className="text-center mt-4" style={{ fontFamily: SANS, fontSize: 11, color: "rgba(84,67,62,0.4)" }}>
                    {selectedIds.size > 0 ? `${selectedIds.size} seleccionado${selectedIds.size > 1 ? "s" : ""} · ` : ""}
                    {filteredProducts.length} de {products.length} productos
                  </p>
                )}
              </div>

              {/* AI Panel sidebar */}
              {!loading && products.length > 0 && (
                <div className="w-72 shrink-0" style={{ position: "sticky", top: 24 }}>
                  <InventoryAIPanel products={products} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Modals ── */}
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
          onOpenChange={open => !open && setProductToDelete(null)}
          productName={productToDelete?.name || ""}
          onConfirm={handleDeleteProduct}
          loading={deleteLoading}
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
        />

<<<<<<< HEAD
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
=======
        {/* ── Bulk actions bar ── */}
        <InventoryBulkActions
          selectedCount={selectedIds.size}
          onDeleteAll={handleBulkDelete}
          onActivateAll={handleBulkActivate}
          onDeactivateAll={handleBulkDeactivate}
          onClearSelection={() => setSelectedIds(new Set())}
          isProcessing={bulkProcessing}
          progress={bulkProgress}
        />
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
      </div>
    </div>
  );
};

export default InventoryPage;
