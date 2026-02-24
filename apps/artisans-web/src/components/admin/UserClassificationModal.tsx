import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserTypeSelector } from './UserTypeSelector';
import { User, Mail, Calendar } from 'lucide-react';

interface UserClassificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    email: string;
    full_name: string;
    created_at: string;
  };
  onSuccess: () => void;
}

export const UserClassificationModal: React.FC<UserClassificationModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess
}) => {
  const [selectedUserType, setSelectedUserType] = useState<'admin' | 'shop_owner' | 'regular' | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClassifyUser = async () => {
    if (!selectedUserType) {
      toast({
        title: 'Selección requerida',
        description: 'Por favor selecciona un tipo de usuario.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-user-by-type', {
        body: {
          email: user.email,
          userType: selectedUserType,
          fullName: user.full_name,
          isClassification: true, // Flag to indicate this is a classification, not a new user
          userId: user.id
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: 'Usuario clasificado',
          description: `Usuario clasificado como ${selectedUserType === 'admin' ? 'Administrador' : selectedUserType === 'shop_owner' ? 'Propietario de Tienda' : 'Usuario Regular'} exitosamente.`,
        });
        onSuccess();
        onClose();
      } else {
        throw new Error(data?.error || 'Error al clasificar usuario');
      }
    } catch (error) {
      console.error('Error classifying user:', error);
      toast({
        title: 'Error',
        description: 'No se pudo clasificar el usuario. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Clasificar Usuario
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>{user.full_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Registrado el {new Date(user.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <Badge variant="outline" className="w-fit">
              Usuario sin clasificar
            </Badge>
          </div>

          {/* User Type Selection */}
          <div>
            <h3 className="text-lg font-medium mb-3">Selecciona el tipo de usuario:</h3>
            <UserTypeSelector
              value={selectedUserType}
              onValueChange={setSelectedUserType}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              onClick={handleClassifyUser} 
              disabled={!selectedUserType || loading}
            >
              {loading ? 'Clasificando...' : 'Clasificar Usuario'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};