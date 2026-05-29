import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { ShopWithProducts } from '@/hooks/useShippingAnalytics';
import {
  ArtisansMap,
  uniqueDepartments,
  countLocated,
} from '@/components/shipping-dashboard/ArtisansMap';

interface ArtisansMapTabProps {
  shopsData: ShopWithProducts[];
}

const ALL = '__ALL__';

export const ArtisansMapTab: React.FC<ArtisansMapTabProps> = ({ shopsData }) => {
  const [department, setDepartment] = useState<string>(ALL);

  const departments = useMemo(() => uniqueDepartments(shopsData), [shopsData]);
  const filterDept = department === ALL ? null : department;
  const counts = useMemo(
    () => countLocated(shopsData, filterDept),
    [shopsData, filterDept],
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base">
            Ubicación geográfica de artesanos
          </CardTitle>
          <div className="text-xs text-muted-foreground flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-green-600" />
              Cobertura Servientrega
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-amber-500" />
              Parcial
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-red-600" />
              Sin cobertura
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-end gap-4 flex-wrap">
            <div className="flex-1 min-w-[220px] max-w-xs">
              <Label className="text-xs mb-1 block">Filtrar por departamento</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los departamentos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos los departamentos</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {department !== ALL && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDepartment(ALL)}
                className="gap-1"
              >
                <X className="w-3 h-3" /> Limpiar
              </Button>
            )}
            <div className="text-sm ml-auto flex items-center gap-4">
              <span><strong>{counts.located}</strong> ubicados</span>
              {counts.missing > 0 && (
                <span className="text-muted-foreground">
                  {counts.missing} sin coordenadas
                </span>
              )}
            </div>
          </div>

          <ArtisansMap
            shopsData={shopsData}
            filterDepartment={filterDept}
            height={560}
          />
        </CardContent>
      </Card>
    </div>
  );
};
