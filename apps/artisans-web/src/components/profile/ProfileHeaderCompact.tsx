import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Store } from 'lucide-react';

export type RutStatus = 'verified' | 'pending' | 'none';

interface ProfileHeaderCompactProps {
  fullName: string;
  brandName?: string;
  avatarUrl?: string;
  rutStatus?: RutStatus;
  email?: string;
}

export const ProfileHeaderCompact: React.FC<ProfileHeaderCompactProps> = ({
  fullName,
  brandName,
  avatarUrl,
  rutStatus = 'none',
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

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6">
      <div className="flex items-center sm:items-start gap-3 sm:gap-6">
        {/* Avatar */}
        <Avatar className="h-14 w-14 sm:h-20 sm:w-20 border-2 sm:border-4 border-background shadow-lg shrink-0">
          <AvatarImage src={avatarUrl} alt={fullName} />
          <AvatarFallback className="text-lg sm:text-2xl font-semibold bg-primary/10 text-primary">
            {getInitials(fullName || 'U')}
          </AvatarFallback>
        </Avatar>

        {/* Info Section - Compact on mobile */}
        <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="font-serif text-lg sm:text-2xl font-bold text-foreground truncate">{fullName || 'Usuario'}</h1>
            {rutStatus === 'verified' && (
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

            {rutStatus === 'verified' && (
              <Badge className="flex items-center gap-1 bg-success/10 text-success hover:bg-success/10 text-xs px-2 py-0.5">
                <CheckCircle2 className="h-3 w-3" />
                RUT verificado
              </Badge>
            )}
            {rutStatus === 'pending' && (
              <Badge className="flex items-center gap-1 bg-brand-orange/10 text-brand-orange-dark hover:bg-brand-orange/10 text-xs px-2 py-0.5">
                <Clock className="h-3 w-3" />
                RUT pendiente
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
