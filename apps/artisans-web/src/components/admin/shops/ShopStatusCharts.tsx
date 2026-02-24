import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ShopStats } from '@/hooks/useAdminShops';

interface ShopStatusChartsProps {
  stats: ShopStats;
}

const COLORS = ['#22c55e', '#eab308', '#ef4444', '#3b82f6'];

export const ShopStatusCharts: React.FC<ShopStatusChartsProps> = ({ stats }) => {
  const statusData = [
    { name: 'En Marketplace', value: stats.marketplace_visible, color: '#22c55e' },
    { name: 'Pendientes', value: stats.pending_approval, color: '#eab308' },
    { name: 'Inactivas', value: stats.inactive, color: '#ef4444' },
  ];

  const regionData = stats.by_region.slice(0, 8).map(r => ({
    name: r.region.length > 15 ? r.region.slice(0, 15) + '...' : r.region,
    tiendas: r.count,
  }));

  const craftData = stats.by_craft_type.slice(0, 8).map(c => ({
    name: c.craft_type.length > 12 ? c.craft_type.slice(0, 12) + '...' : c.craft_type,
    tiendas: c.count,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Status Donut */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Estado de Tiendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} tiendas`, '']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend 
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* By Region */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Por Región</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData} layout="vertical" margin={{ left: 0, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={80} 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value} tiendas`, '']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="tiendas" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* By Craft Type */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Por Tipo de Artesanía</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={craftData} layout="vertical" margin={{ left: 0, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={80} 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value} tiendas`, '']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="tiendas" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
