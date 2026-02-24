import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useMilestoneProgressHistory } from '@/hooks/useMilestoneProgressHistory';
import { UnifiedProgress } from '@/types/unifiedProgress';
import { TrendingUp, Calendar } from 'lucide-react';

interface MilestoneProgressChartProps {
  unifiedProgress: UnifiedProgress;
}

const MILESTONE_COLORS: Record<string, string> = {
  formalization: 'hsl(var(--primary))',
  brand: 'hsl(var(--secondary))',
  shop: 'hsl(var(--accent))',
  sales: 'hsl(var(--success))',
  community: 'hsl(var(--warning))'
};

const MILESTONE_LABELS: Record<string, string> = {
  formalization: 'Formalización',
  brand: 'Identidad de Marca',
  shop: 'Tienda Online',
  sales: 'Primeras Ventas',
  community: 'Comunidad'
};

export const MilestoneProgressChart: React.FC<MilestoneProgressChartProps> = ({
  unifiedProgress
}) => {
  const { fetchMilestoneHistory } = useMilestoneProgressHistory(unifiedProgress);
  const [chartData, setChartData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistoricalData = async () => {
      setLoading(true);
      
      try {
        // Fetch history for all milestones
        const days = parseInt(timeRange);
        const milestoneIds = Object.keys(unifiedProgress.milestones);
        
        const historyPromises = milestoneIds.map(id => 
          fetchMilestoneHistory(id, days)
        );
        
        const histories = await Promise.all(historyPromises);
        
        // Combine data by date
        const dataByDate: Record<string, any> = {};
        
        histories.forEach((history, index) => {
          const milestoneId = milestoneIds[index];
          
          history.forEach((record: any) => {
            const date = new Date(record.recorded_at).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short'
            });
            
            if (!dataByDate[date]) {
              dataByDate[date] = { date };
            }
            
            dataByDate[date][milestoneId] = record.progress;
          });
        });
        
        // Convert to array and sort by date
        const chartArray = Object.values(dataByDate).sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        
        setChartData(chartArray);
      } catch (error) {
        console.error('Error loading chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistoricalData();
  }, [unifiedProgress, timeRange, fetchMilestoneHistory]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando gráficos...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Evolución del Progreso
          </CardTitle>
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <TabsList>
              <TabsTrigger value="7">7 días</TabsTrigger>
              <TabsTrigger value="30">30 días</TabsTrigger>
              <TabsTrigger value="90">90 días</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <p className="text-sm text-muted-foreground">
          Visualiza tu progreso histórico en cada hito
        </p>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay datos históricos aún</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Comienza a trabajar en tus tareas y tu progreso se registrará automáticamente cada día.
              Vuelve en unos días para ver tu evolución.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="area" className="space-y-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="area">Vista por Área</TabsTrigger>
              <TabsTrigger value="line">Vista Lineal</TabsTrigger>
            </TabsList>

            <TabsContent value="area">
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <defs>
                    {Object.keys(MILESTONE_COLORS).map(milestoneId => (
                      <linearGradient key={milestoneId} id={`color${milestoneId}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={MILESTONE_COLORS[milestoneId]} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={MILESTONE_COLORS[milestoneId]} stopOpacity={0}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    label={{ value: 'Progreso (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                  />
                  <Legend 
                    formatter={(value) => MILESTONE_LABELS[value] || value}
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                  {Object.keys(MILESTONE_COLORS).map(milestoneId => (
                    <Area
                      key={milestoneId}
                      type="monotone"
                      dataKey={milestoneId}
                      stroke={MILESTONE_COLORS[milestoneId]}
                      fillOpacity={1}
                      fill={`url(#color${milestoneId})`}
                      name={milestoneId}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="line">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    label={{ value: 'Progreso (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                  />
                  <Legend 
                    formatter={(value) => MILESTONE_LABELS[value] || value}
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                  {Object.keys(MILESTONE_COLORS).map(milestoneId => (
                    <Line
                      key={milestoneId}
                      type="monotone"
                      dataKey={milestoneId}
                      stroke={MILESTONE_COLORS[milestoneId]}
                      strokeWidth={2}
                      dot={{ fill: MILESTONE_COLORS[milestoneId], r: 4 }}
                      activeDot={{ r: 6 }}
                      name={milestoneId}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 pt-6 border-t">
          {Object.entries(MILESTONE_LABELS).map(([id, label]) => {
            const milestone = unifiedProgress.milestones[id as keyof typeof unifiedProgress.milestones];
            return (
              <div key={id} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: MILESTONE_COLORS[id] }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{label}</p>
                  <Badge variant="secondary" className="text-xs">
                    {milestone?.progress.toFixed(0)}%
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
