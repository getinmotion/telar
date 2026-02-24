/**
 * ForceCompleteProfileModal
 * 
 * Modal obligatorio que aparece cuando un usuario tiene datos críticos incompletos
 * (WhatsApp, departamento, ciudad). No se puede cerrar hasta completar los datos.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useColombiaLocations } from '@/hooks/useColombiaLocations';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { User, Phone, MapPin, Building2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateUserProfile } from '@/services/userProfiles.actions';

interface ForceCompleteProfileModalProps {
  isOpen: boolean;
  missingFields: {
    whatsapp: boolean;
    department: boolean;
    city: boolean;
  };
  currentData: {
    whatsapp?: string;
    department?: string;
    city?: string;
  };
  onComplete: () => void;
}

export const ForceCompleteProfileModal: React.FC<ForceCompleteProfileModalProps> = ({
  isOpen,
  missingFields,
  currentData,
  onComplete
}) => {
  const { user } = useAuth();
  const { departments, getMunicipalities, isLoading: locationsLoading } = useColombiaLocations();
  
  const [whatsapp, setWhatsapp] = useState(currentData.whatsapp || '+57');
  const [department, setDepartment] = useState(currentData.department || '');
  const [city, setCity] = useState(currentData.city || '');
  const [cities, setCities] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update cities when department changes
  useEffect(() => {
    if (department) {
      const municipios = getMunicipalities(department);
      setCities(municipios);
      // Reset city if it's not in the new list
      if (city && !municipios.includes(city)) {
        setCity('');
      }
    } else {
      setCities([]);
      setCity('');
    }
  }, [department, getMunicipalities]);

  const validateWhatsapp = (value: string): boolean => {
    const regex = /^\+57\d{10}$/;
    return regex.test(value);
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Ensure it starts with +57
    if (!value.startsWith('+57')) {
      value = '+57' + value.replace(/^\+?57?/, '');
    }
    
    // Only allow digits after +57
    const digits = value.slice(3).replace(/\D/g, '').slice(0, 10);
    value = '+57' + digits;
    
    setWhatsapp(value);
    
    // Clear error if valid
    if (validateWhatsapp(value)) {
      setErrors(prev => ({ ...prev, whatsapp: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (missingFields.whatsapp && !validateWhatsapp(whatsapp)) {
      newErrors.whatsapp = 'Ingresa un número válido: +57 seguido de 10 dígitos';
    }
    
    if (missingFields.department && !department) {
      newErrors.department = 'Selecciona tu departamento';
    }
    
    if (missingFields.city && !city) {
      newErrors.city = 'Selecciona tu ciudad/municipio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;
    
    setSaving(true);
    
    try {
      const updateData: any = {};
      
      if (missingFields.whatsapp) {
        updateData.whatsappE164 = whatsapp;
      }
      if (missingFields.department) {
        updateData.department = department;
      }
      if (missingFields.city) {
        updateData.city = city;
      }
      
      // ✅ Migrado a endpoint NestJS (PATCH /telar/server/user-profiles/:userId)
      await updateUserProfile(user.id, updateData);
      
      toast.success('¡Perfil actualizado!', {
        description: 'Tus datos se han guardado correctamente.'
      });
      
      onComplete();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Error al guardar', {
        description: 'No pudimos guardar tus datos. Intenta de nuevo.'
      });
    } finally {
      setSaving(false);
    }
  };

  const missingCount = Object.values(missingFields).filter(Boolean).length;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-warning/10">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
            <DialogTitle className="text-xl">Completa tu Perfil</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Necesitamos algunos datos importantes para brindarte la mejor experiencia.
            {missingCount > 1 && ` (${missingCount} campos pendientes)`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* WhatsApp Field */}
          {missingFields.whatsapp && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <Label htmlFor="whatsapp" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                WhatsApp <span className="text-destructive">*</span>
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                value={whatsapp}
                onChange={handleWhatsappChange}
                placeholder="+57 300 123 4567"
                className={errors.whatsapp ? 'border-destructive' : ''}
              />
              {errors.whatsapp && (
                <p className="text-sm text-destructive">{errors.whatsapp}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Usaremos este número para contactarte sobre tus pedidos
              </p>
            </motion.div>
          )}
          
          {/* Department Field */}
          {missingFields.department && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <Label htmlFor="department" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Departamento <span className="text-destructive">*</span>
              </Label>
              <Select
                value={department}
                onValueChange={(value) => {
                  setDepartment(value);
                  setErrors(prev => ({ ...prev, department: '' }));
                }}
                disabled={locationsLoading}
              >
                <SelectTrigger className={errors.department ? 'border-destructive' : ''}>
                  <SelectValue placeholder={locationsLoading ? 'Cargando...' : 'Selecciona tu departamento'} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-sm text-destructive">{errors.department}</p>
              )}
            </motion.div>
          )}
          
          {/* City Field */}
          {missingFields.city && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <Label htmlFor="city" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Ciudad/Municipio <span className="text-destructive">*</span>
              </Label>
              <Select
                value={city}
                onValueChange={(value) => {
                  setCity(value);
                  setErrors(prev => ({ ...prev, city: '' }));
                }}
                disabled={!department || cities.length === 0}
              >
                <SelectTrigger className={errors.city ? 'border-destructive' : ''}>
                  <SelectValue placeholder={!department ? 'Primero selecciona departamento' : 'Selecciona tu ciudad'} />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && (
                <p className="text-sm text-destructive">{errors.city}</p>
              )}
            </motion.div>
          )}
        </div>
        
        <div className="mt-6">
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full"
            size="lg"
          >
            {saving ? (
              <>Guardando...</>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Guardar y Continuar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
