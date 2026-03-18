import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Gift, Mail, MessageSquare, ShoppingCart, Check, Info } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const GIFTCARD_OPTIONS = [
  { id: 'gc-100k', name: 'Gift Card $100.000', amount: 100000 },
  { id: 'gc-200k', name: 'Gift Card $200.000', amount: 200000 },
  { id: 'gc-300k', name: 'Gift Card $300.000', amount: 300000 },
  { id: 'gc-500k', name: 'Gift Card $500.000', amount: 500000 },
  { id: 'gc-1m', name: 'Gift Card $1.000.000', amount: 1000000 },
  { id: 'gc-2m', name: 'Gift Card $2.000.000', amount: 2000000 },
];

interface GiftCardForm {
  recipientEmail: string;
  message: string;
}

const GiftCards = () => {
  const { addGiftCardToCart } = useCart();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, GiftCardForm>>({});
  const [addedCards, setAddedCards] = useState<Set<string>>(new Set());

  const fmt = (v: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(v);

  const handleFormChange = (cardId: string, field: keyof GiftCardForm, value: string) => {
    setForms(prev => ({
      ...prev,
      [cardId]: {
        ...prev[cardId],
        [field]: value
      }
    }));
  };

  const handleAddToCart = async (card: typeof GIFTCARD_OPTIONS[0]) => {
    const form = forms[card.id] || { recipientEmail: '', message: '' };
    
    await addGiftCardToCart(
      card.amount,
      form.recipientEmail || undefined,
      form.message || undefined
    );

    setAddedCards(prev => new Set([...prev, card.id]));
    
    // Reset after 2 seconds
    setTimeout(() => {
      setAddedCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(card.id);
        return newSet;
      });
    }, 2000);

    // Clear form
    setForms(prev => ({
      ...prev,
      [card.id]: { recipientEmail: '', message: '' }
    }));
    setSelectedCard(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 md:py-24">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                <Gift className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Regala una Gift Card de Telar
              </h1>
              <p className="text-xl text-muted-foreground">
                El regalo perfecto para quienes aman la artesanía colombiana. 
                Deja que elijan sus propias piezas únicas.
              </p>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-12 border-b border-border/50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Úsala en todo el Marketplace</h3>
                    <p className="text-sm text-muted-foreground">
                      Válida para cualquier producto artesanal de Telar
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Info className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Usa el saldo varias veces</h3>
                    <p className="text-sm text-muted-foreground">
                      No tiene que gastarse en una sola compra
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Entrega por correo</h3>
                    <p className="text-sm text-muted-foreground">
                      El código llega al email con instrucciones
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gift Card Options */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-semibold text-center mb-10">
              Elige el valor de tu Gift Card
            </h2>
            
            <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {GIFTCARD_OPTIONS.map((card) => {
                const isSelected = selectedCard === card.id;
                const isAdded = addedCards.has(card.id);
                
                return (
                  <Card 
                    key={card.id}
                    className={`relative overflow-hidden transition-all duration-300 ${
                      isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
                    }`}
                  >
                    {/* Decorative gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none" />
                    
                    <CardContent className="relative p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Gift className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-bold">{fmt(card.amount)}</span>
                      </div>
                      
                      <h3 className="font-medium mb-4">{card.name}</h3>
                      
                      {isSelected ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`email-${card.id}`} className="text-sm flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              Email del destinatario (opcional)
                            </Label>
                            <Input
                              id={`email-${card.id}`}
                              type="email"
                              placeholder="regalo@ejemplo.com"
                              value={forms[card.id]?.recipientEmail || ''}
                              onChange={(e) => handleFormChange(card.id, 'recipientEmail', e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`message-${card.id}`} className="text-sm flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              Mensaje de dedicatoria (opcional)
                            </Label>
                            <Textarea
                              id={`message-${card.id}`}
                              placeholder="¡Feliz cumpleaños! Espero que encuentres algo especial..."
                              value={forms[card.id]?.message || ''}
                              onChange={(e) => handleFormChange(card.id, 'message', e.target.value)}
                              rows={3}
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => setSelectedCard(null)}
                            >
                              Cancelar
                            </Button>
                            <Button 
                              className="flex-1"
                              onClick={() => handleAddToCart(card)}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Agregar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          className="w-full"
                          variant={isAdded ? "secondary" : "default"}
                          onClick={() => isAdded ? null : setSelectedCard(card.id)}
                          disabled={isAdded}
                        >
                          {isAdded ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Agregada al carrito
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Seleccionar
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold text-center mb-8">
                Preguntas frecuentes
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">¿Cómo funciona la Gift Card?</h3>
                  <p className="text-muted-foreground">
                    Al completar la compra, el destinatario recibirá un código único por correo electrónico. 
                    Este código se puede usar en el checkout de cualquier compra en el Marketplace de Telar.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">¿La Gift Card tiene fecha de vencimiento?</h3>
                  <p className="text-muted-foreground">
                    Las Gift Cards de Telar no tienen fecha de vencimiento. El saldo permanece disponible 
                    hasta que se utilice por completo.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">¿Puedo usar la Gift Card en varias compras?</h3>
                  <p className="text-muted-foreground">
                    ¡Sí! Si tu compra es menor al saldo de la Gift Card, el resto queda disponible para 
                    futuras compras. También puedes combinarla con otros métodos de pago.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">¿Puedo regalar varias Gift Cards a la vez?</h3>
                  <p className="text-muted-foreground">
                    Absolutamente. Puedes agregar múltiples Gift Cards al carrito, cada una con un 
                    destinatario y mensaje diferente si lo deseas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default GiftCards;
