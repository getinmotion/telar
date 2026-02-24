import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressRing } from '@/components/ui/progress-ring';
import { 
  User, 
  Target, 
  TrendingUp, 
  MapPin, 
  Calendar,
  Users,
  Clock
} from 'lucide-react';
import { UserProfileData } from '@/components/cultural/types/wizardTypes';

interface DebugProfileCardProps {
  profileData: UserProfileData | null;
}

export const DebugProfileCard: React.FC<DebugProfileCardProps> = ({ profileData }) => {
  if (!profileData) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-muted-foreground text-center">No hay datos de perfil disponibles</p>
        </CardContent>
      </Card>
    );
  }

  const InfoItem = ({ icon: Icon, label, value, badge }: any) => (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-sm font-semibold mt-0.5 break-words">{value || 'N/A'}</p>
        {badge && <Badge className="mt-1">{badge}</Badge>}
      </div>
    </div>
  );

  const ArrayItem = ({ icon: Icon, label, items }: any) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <p className="text-sm font-semibold">{label}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {items && items.length > 0 ? (
          items.map((item: string, idx: number) => (
            <Badge key={idx} variant="outline">{item}</Badge>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">No especificado</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Progress Rings */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil del Artesano</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <ProgressRing
                progress={profileData.customerClarity ? (profileData.customerClarity * 10) : 0}
                size={100}
                strokeWidth={8}
                color="#22c55e"
                showPercentage={false}
              >
                <div>
                  <p className="text-2xl font-bold">{profileData.customerClarity || 0}</p>
                  <p className="text-xs text-muted-foreground">/ 10</p>
                </div>
              </ProgressRing>
              <p className="text-sm font-semibold mt-2">Claridad de Cliente</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <ProgressRing
                progress={profileData.profitClarity ? (profileData.profitClarity * 10) : 0}
                size={100}
                strokeWidth={8}
                color="#3b82f6"
                showPercentage={false}
              >
                <div>
                  <p className="text-2xl font-bold">{profileData.profitClarity || 0}</p>
                  <p className="text-xs text-muted-foreground">/ 10</p>
                </div>
              </ProgressRing>
              <p className="text-sm font-semibold mt-2">Claridad de Ganancia</p>
            </div>

            <div className="flex flex-col items-center justify-center text-center">
              <div className="space-y-2">
                <Badge variant={profileData.hasSold ? 'default' : 'secondary'} className="text-sm">
                  {profileData.hasSold ? '✅ Ha vendido' : '⚠️ Sin ventas'}
                </Badge>
                {profileData.salesConsistency && (
                  <Badge variant="outline" className="text-sm">
                    {profileData.salesConsistency}
                  </Badge>
                )}
                {profileData.craftType && (
                  <Badge className="text-sm bg-purple-500">
                    {profileData.craftType}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información del Negocio</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <InfoItem
            icon={User}
            label="Nombre de la Marca"
            value={profileData.brandName}
          />
          <InfoItem
            icon={MapPin}
            label="Ubicación"
            value={profileData.businessLocation}
          />
          <InfoItem
            icon={TrendingUp}
            label="Meta de Ingresos Mensual"
            value={profileData.monthlyRevenueGoal ? `$${profileData.monthlyRevenueGoal}` : 'No especificada'}
          />
          <InfoItem
            icon={Calendar}
            label="Años en el Negocio"
            value={profileData.yearsInBusiness || 0}
          />
          <InfoItem
            icon={Users}
            label="Tamaño del Equipo"
            value={profileData.teamSize}
          />
          <InfoItem
            icon={Clock}
            label="Disponibilidad de Tiempo"
            value={profileData.timeAvailability}
          />
        </CardContent>
      </Card>

      {/* Description */}
      {profileData.businessDescription && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Descripción del Negocio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{profileData.businessDescription}</p>
          </CardContent>
        </Card>
      )}

      {/* Lists and Arrays */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalles Adicionales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ArrayItem
            icon={Target}
            label="Actividades"
            items={profileData.activities}
          />
          <ArrayItem
            icon={TrendingUp}
            label="Canales de Promoción"
            items={profileData.promotionChannels}
          />
          <ArrayItem
            icon={Target}
            label="Objetivos del Negocio"
            items={profileData.businessGoals}
          />
          {profileData.mainObstacles && profileData.mainObstacles.length > 0 && (
            <ArrayItem
              icon={Target}
              label="Principales Obstáculos"
              items={profileData.mainObstacles}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
