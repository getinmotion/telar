import { useState, useEffect } from "react";
import { usePromotions } from "@/hooks/usePromotions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Eye, Ban, CreditCard, Plus, Unlock } from "lucide-react";

interface GiftCard {
  id: string;
  code: string;
  initial_amount: number;
  remaining_amount: number;
  currency: string;
  status: "active" | "expired" | "depleted" | "blocked";
  expiration_date: string | null;
  purchaser_email: string;
  recipient_email: string | null;
  message: string | null;
  marketplace_order_id: string | null;
  created_at: string;
}

interface Transaction {
  id: string;
  gift_card_id: string;
  order_id: string;
  amount_used: number;
  created_at: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Activa", variant: "default" },
  expired: { label: "Expirada", variant: "secondary" },
  depleted: { label: "Agotada", variant: "outline" },
  blocked: { label: "Bloqueada", variant: "destructive" },
};

export function GiftCardManagement() {
  const { loading, listGiftCards, getGiftCardTransactions, blockGiftCard, unblockGiftCard, createGiftCard } = usePromotions();
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCard, setNewCard] = useState({
    amount: "",
    purchaser_email: "",
    recipient_email: "",
    message: "",
    expiration_days: "365",
  });

  const loadGiftCards = async () => {
    const filters = statusFilter !== "all" ? { status: statusFilter } : undefined;
    const data = await listGiftCards(filters);
    setGiftCards(data);
  };

  useEffect(() => {
    loadGiftCards();
  }, [statusFilter]);

  const handleViewDetail = async (card: GiftCard) => {
    setSelectedCard(card);
    const txs = await getGiftCardTransactions(card.id);
    setTransactions(txs);
    setIsDetailOpen(true);
  };

  const handleBlock = async (id: string) => {
    if (confirm("¿Bloquear esta gift card? No podrá ser usada.")) {
      const success = await blockGiftCard(id);
      if (success) loadGiftCards();
    }
  };

  const handleUnblock = async (id: string) => {
    const success = await unblockGiftCard(id);
    if (success) loadGiftCards();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.amount || !newCard.purchaser_email) return;

    const result = await createGiftCard({
      amount: parseFloat(newCard.amount),
      purchaser_email: newCard.purchaser_email,
      recipient_email: newCard.recipient_email || undefined,
      message: newCard.message || undefined,
      expiration_days: parseInt(newCard.expiration_days) || 365,
    });

    if (result) {
      setIsCreateOpen(false);
      setNewCard({ amount: "", purchaser_email: "", recipient_email: "", message: "", expiration_days: "365" });
      loadGiftCards();
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gift Cards</h2>
          <p className="text-muted-foreground">Gestiona las tarjetas de regalo</p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activas</SelectItem>
              <SelectItem value="depleted">Agotadas</SelectItem>
              <SelectItem value="expired">Expiradas</SelectItem>
              <SelectItem value="blocked">Bloqueadas</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadGiftCards} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Gift Card
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Monto Inicial</TableHead>
              <TableHead>Saldo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Comprador</TableHead>
              <TableHead>Expira</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {giftCards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No hay gift cards
                </TableCell>
              </TableRow>
            ) : (
              giftCards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell className="font-mono font-bold">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      {card.code}
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(card.initial_amount)}</TableCell>
                  <TableCell className={card.remaining_amount === 0 ? "text-muted-foreground" : "text-success font-medium"}>
                    {formatCurrency(card.remaining_amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[card.status]?.variant || "default"}>
                      {statusConfig[card.status]?.label || card.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{card.purchaser_email}</TableCell>
                  <TableCell className="text-sm">{formatDate(card.expiration_date)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleViewDetail(card)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {card.status === "active" && (
                        <Button size="sm" variant="ghost" onClick={() => handleBlock(card.id)} title="Bloquear">
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                      {card.status === "blocked" && (
                        <Button size="sm" variant="ghost" onClick={() => handleUnblock(card.id)} title="Desbloquear">
                          <Unlock className="h-4 w-4" />
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

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Detalle de Gift Card</DialogTitle>
          </DialogHeader>
          {selectedCard && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Código:</span>
                  <p className="font-mono font-bold text-lg">{selectedCard.code}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Estado:</span>
                  <p>
                    <Badge variant={statusConfig[selectedCard.status]?.variant}>
                      {statusConfig[selectedCard.status]?.label}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Monto Inicial:</span>
                  <p className="font-medium">{formatCurrency(selectedCard.initial_amount)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Saldo Disponible:</span>
                  <p className="font-medium text-success">{formatCurrency(selectedCard.remaining_amount)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Comprador:</span>
                  <p>{selectedCard.purchaser_email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Destinatario:</span>
                  <p>{selectedCard.recipient_email || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Creada:</span>
                  <p>{formatDate(selectedCard.created_at)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Expira:</span>
                  <p>{formatDate(selectedCard.expiration_date)}</p>
                </div>
              </div>

              {selectedCard.message && (
                <div>
                  <span className="text-muted-foreground text-sm">Mensaje:</span>
                  <p className="bg-muted p-2 rounded text-sm italic">"{selectedCard.message}"</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Transacciones</h4>
                {transactions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Sin transacciones registradas</p>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Orden</TableHead>
                          <TableHead>Monto Usado</TableHead>
                          <TableHead>Fecha</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell className="font-mono text-sm">{tx.order_id}</TableCell>
                            <TableCell>{formatCurrency(tx.amount_used)}</TableCell>
                            <TableCell className="text-sm">{formatDate(tx.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Gift Card</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Monto (COP) *</Label>
              <Input
                type="number"
                value={newCard.amount}
                onChange={(e) => setNewCard({ ...newCard, amount: e.target.value })}
                placeholder="100000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email del comprador *</Label>
              <Input
                type="email"
                value={newCard.purchaser_email}
                onChange={(e) => setNewCard({ ...newCard, purchaser_email: e.target.value })}
                placeholder="comprador@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email del destinatario (opcional)</Label>
              <Input
                type="email"
                value={newCard.recipient_email}
                onChange={(e) => setNewCard({ ...newCard, recipient_email: e.target.value })}
                placeholder="destinatario@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Mensaje (opcional)</Label>
              <Textarea
                value={newCard.message}
                onChange={(e) => setNewCard({ ...newCard, message: e.target.value })}
                placeholder="¡Feliz cumpleaños!"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Días hasta expiración</Label>
              <Input
                type="number"
                value={newCard.expiration_days}
                onChange={(e) => setNewCard({ ...newCard, expiration_days: e.target.value })}
                placeholder="365"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                Crear
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
