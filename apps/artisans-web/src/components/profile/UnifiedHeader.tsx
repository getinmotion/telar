import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UnifiedHeaderProps {
  isArtisan: boolean;
  profileName: string;
  shopName?: string;
  craftType?: string;
  maturityLevel: number;
  avatarUrl?: string | null;
  onEditClick?: () => void;
}

export const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  isArtisan,
  profileName,
  shopName,
  craftType,
  maturityLevel,
  avatarUrl,
  onEditClick
}) => {
  const navigate = useNavigate();

  const getMaturityColor = (level: number) => {
    if (level >= 75) return 'bg-gradient-to-r from-green-500 to-emerald-600';
    if (level >= 50) return 'bg-gradient-to-r from-blue-500 to-cyan-600';
    if (level >= 25) return 'bg-gradient-to-r from-yellow-500 to-orange-600';
    return 'bg-gradient-to-r from-red-500 to-pink-600';
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-float border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver al Taller Digital
        </Button>
        {onEditClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEditClick}
            className="gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Editar
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white text-2xl font-bold">
            {shopName ? shopName.charAt(0).toUpperCase() : profileName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">
            {isArtisan ? `¡Hola! ${profileName}` : profileName}
          </h1>
          {isArtisan && shopName && (
            <p className="text-lg text-muted-foreground mb-2">{shopName}</p>
          )}
          {!isArtisan && (
            <p className="text-muted-foreground">Tu perfil de negocio</p>
          )}
        </div>

        <div className="flex flex-col gap-2 items-end">
          {craftType && (
            <Badge className="text-sm px-4 py-1.5 bg-primary/10 text-primary border-primary/20">
              {craftType.charAt(0).toUpperCase() + craftType.slice(1)}
            </Badge>
          )}
          <div className="flex items-center gap-2">
            <div className={`px-4 py-1.5 rounded-full ${getMaturityColor(maturityLevel)} text-white text-sm font-semibold shadow-md`}>
              Nivel: {maturityLevel}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
