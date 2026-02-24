import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, ShoppingBag, Users, Target, Calculator, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import confetti from 'canvas-confetti';

interface SalesStrategyModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
  stepTitle: string;
}

interface SalesChannel {
  id: string;
  name: string;
  icon: any;
  selected: boolean;
  commission: string;
  pros: string[];
}

const SALES_CHANNELS: SalesChannel[] = [
  {
    id: 'own-store',
    name: 'Tienda Propia',
    icon: ShoppingBag,
    selected: false,
    commission: '0%',
    pros: ['Control total', 'Mejor margen', 'Marca propia']
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    icon: TrendingUp,
    selected: false,
    commission: '5-15%',
    pros: ['Mayor visibilidad', 'Logística incluida', 'Tráfico garantizado']
  },
  {
    id: 'social',
    name: 'Redes Sociales',
    icon: Users,
    selected: false,
    commission: '0%',
    pros: ['Directo al cliente', 'Bajo costo', 'Relación cercana']
  },
  {
    id: 'fairs',
    name: 'Ferias Artesanales',
    icon: Target,
    selected: false,
    commission: 'Variable',
    pros: ['Contacto directo', 'Networking', 'Feedback inmediato']
  }
];

export const SalesStrategyModal: React.FC<SalesStrategyModalProps> = ({
  open,
  onClose,
  onComplete,
  stepTitle
}) => {
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const [channels, setChannels] = useState<SalesChannel[]>(SALES_CHANNELS);
  const [monthlySalesGoal, setMonthlySalesGoal] = useState<number>(0);
  const [averageTicket, setAverageTicket] = useState<number>(0);
  const [conversionRate, setConversionRate] = useState<number>(2);

  useEffect(() => {
    const completedFields = [
      channels.some(c => c.selected),
      monthlySalesGoal > 0,
      averageTicket > 0
    ].filter(Boolean).length;
    setProgress((completedFields / 3) * 100);
  }, [channels, monthlySalesGoal, averageTicket]);

  const toggleChannel = (channelId: string) => {
    setChannels(prev => prev.map(c => 
      c.id === channelId ? { ...c, selected: !c.selected } : c
    ));
  };

  const calculateRequiredVisits = () => {
    if (!monthlySalesGoal || !averageTicket || conversionRate === 0) return 0;
    const salesNeeded = monthlySalesGoal / averageTicket;
    return Math.ceil(salesNeeded / (conversionRate / 100));
  };

  const handleComplete = () => {
    const selectedChannels = channels.filter(c => c.selected);
    
    if (selectedChannels.length === 0) {
      toast({
        title: 'Selecciona al menos un canal',
        description: 'Elige cómo vas a vender tus productos',
        variant: 'destructive'
      });
      return;
    }

    if (!monthlySalesGoal || !averageTicket) {
      toast({
        title: 'Completa los objetivos',
        description: 'Define tu meta de ventas y ticket promedio',
        variant: 'destructive'
      });
      return;
    }

    const strategy = {
      channels: selectedChannels.map(c => ({
        name: c.name,
        commission: c.commission
      })),
      monthlySalesGoal,
      averageTicket,
      conversionRate,
      requiredVisits: calculateRequiredVisits(),
      estimatedSales: Math.floor(monthlySalesGoal / averageTicket)
    };

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    toast({
      title: '📈 ¡Estrategia definida!',
      description: `${selectedChannels.length} canales de venta configurados`
    });

    onComplete(strategy);
    onClose();
  };

  const requiredVisits = calculateRequiredVisits();
  const estimatedSales = monthlySalesGoal && averageTicket ? Math.floor(monthlySalesGoal / averageTicket) : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="w-5 h-5 text-primary" />
            Planificador de Estrategia de Ventas
          </DialogTitle>
          <DialogDescription>
            Define tus canales de venta y objetivos comerciales
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="h-2 mb-4" />

        <div className="space-y-6">
          {/* Sales Channels */}
          <div className="space-y-3">
            <h3 className="font-semibold">Canales de Venta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {channels.map(channel => (
                <div
                  key={channel.id}
                  onClick={() => toggleChannel(channel.id)}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-all
                    ${channel.selected ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={channel.selected}
                      onCheckedChange={() => toggleChannel(channel.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <channel.icon className="w-5 h-5 text-primary" />
                        <h4 className="font-semibold">{channel.name}</h4>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {channel.commission}
                        </Badge>
                      </div>
                      <ul className="space-y-1">
                        {channel.pros.map((pro, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="text-success">✓</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sales Goals */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="w-5 h-5" />
              Objetivos de Venta
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Meta de Ventas Mensual (COP)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={monthlySalesGoal || ''}
                    onChange={(e) => setMonthlySalesGoal(Number(e.target.value))}
                    placeholder="1000000"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ticket Promedio (COP)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={averageTicket || ''}
                    onChange={(e) => setAverageTicket(Number(e.target.value))}
                    placeholder="50000"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tasa de Conversión Estimada: {conversionRate}%
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={conversionRate}
                onChange={(e) => setConversionRate(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Porcentaje de visitantes que compran (promedio artesanía: 2-5%)
              </p>
            </div>
          </div>

          {/* Calculations */}
          {monthlySalesGoal > 0 && averageTicket > 0 && (
            <div className="bg-primary/10 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Proyecciones</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Ventas Necesarias</p>
                  <p className="text-2xl font-bold text-primary">{estimatedSales}</p>
                  <p className="text-xs text-muted-foreground">unidades/mes</p>
                </div>

                <div className="bg-background rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Visitas Requeridas</p>
                  <p className="text-2xl font-bold text-primary">{requiredVisits.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">visitantes/mes</p>
                </div>

                <div className="bg-background rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Ventas por Día</p>
                  <p className="text-2xl font-bold text-primary">{Math.ceil(estimatedSales / 30)}</p>
                  <p className="text-xs text-muted-foreground">aprox.</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                💡 Para alcanzar tu meta de ${monthlySalesGoal.toLocaleString()} COP, necesitas aproximadamente {Math.ceil(estimatedSales / 30)} ventas diarias con un ticket de ${averageTicket.toLocaleString()}.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleComplete}>Completar Estrategia</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
