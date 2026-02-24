import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Camera, CheckCircle2, Star, Store } from 'lucide-react';

interface ProfileHeaderCompactProps {
  fullName: string;
  brandName?: string;
  avatarUrl?: string;
  maturityLevel?: number;
  isVerified?: boolean;
  email?: string;
}

export const ProfileHeaderCompact: React.FC<ProfileHeaderCompactProps> = ({
  fullName,
  brandName,
  avatarUrl,
  maturityLevel = 0,
  isVerified = false,
  email,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getMaturityLabel = (level: number) => {
    if (level >= 80) return 'Experto';
    if (level >= 60) return 'Avanzado';
    if (level >= 40) return 'Intermedio';
    if (level >= 20) return 'Principiante';
    return 'Iniciando';
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-sm">
      <div className="flex items-center sm:items-start gap-3 sm:gap-6">
        {/* Avatar Section - Smaller on mobile */}
        <div className="relative group shrink-0">
          <Avatar className="h-14 w-14 sm:h-20 sm:w-20 border-2 sm:border-4 border-background shadow-lg">
            <AvatarImage src={avatarUrl} alt={fullName} />
            <AvatarFallback className="text-lg sm:text-2xl font-semibold bg-primary/10 text-primary">
              {getInitials(fullName || 'U')}
            </AvatarFallback>
          </Avatar>
          <button 
            className="absolute bottom-0 right-0 p-1.5 sm:p-2 bg-primary text-primary-foreground rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label="Cambiar foto de perfil"
          >
            <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </div>

        {/* Info Section - Compact on mobile */}
        <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">{fullName || 'Usuario'}</h1>
            {isVerified && (
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-success shrink-0" />
            )}
          </div>
          
          {brandName && (
            <p className="text-sm sm:text-lg text-muted-foreground truncate">{brandName}</p>
          )}
          
          {email && (
            <p className="text-xs sm:text-sm text-muted-foreground truncate hidden sm:block">{email}</p>
          )}

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
            <Badge variant="secondary" className="flex items-center gap-1 text-xs px-2 py-0.5">
              <Store className="h-3 w-3" />
              Artesano
            </Badge>
            
            {maturityLevel > 0 && (
              <Badge 
                variant="outline" 
                className="flex items-center gap-1 border-primary/30 text-primary text-xs px-2 py-0.5"
              >
                <Star className="h-3 w-3 fill-current" />
                <span className="hidden sm:inline">{getMaturityLabel(maturityLevel)}</span> {maturityLevel}%
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
