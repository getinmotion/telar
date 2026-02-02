import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Phone, MapPin, Pencil, Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useColombiaLocations } from '@/hooks/useColombiaLocations';
import { Skeleton } from '@/components/ui/skeleton';

interface PersonalInfoSectionProps {
  fullName: string;
  email: string;
  phone?: string;
  department?: string;
  city?: string;
  onSave: (data: Partial<PersonalData>) => Promise<void>;
}

interface PersonalData {
  fullName: string;
  whatsappE164: string;
  department: string;
  city: string;
}

// ============= EXTRACTED MEMOIZED COMPONENTS =============

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
  isEditing: boolean;
  fieldKey?: keyof PersonalData;
  placeholder?: string;
  type?: string;
  onChange?: (fieldKey: keyof PersonalData, value: string) => void;
}

const InfoRow = React.memo<InfoRowProps>(({ 
  icon: Icon, 
  label, 
  value, 
  isEditing,
  fieldKey,
  placeholder,
  type = 'text',
  onChange
}) => (
  <div className="flex items-start gap-3 sm:gap-4 py-3 sm:py-4 border-b border-border last:border-0">
    <div className="p-1.5 sm:p-2 bg-muted rounded-lg shrink-0">
      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs sm:text-sm font-medium text-muted-foreground">{label}</p>
      {isEditing && fieldKey && onChange ? (
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          placeholder={placeholder}
          className="mt-1 h-9 text-sm"
        />
      ) : (
        <p className="text-sm sm:text-base text-foreground truncate">{value || 'No especificado'}</p>
      )}
    </div>
  </div>
));

InfoRow.displayName = 'InfoRow';

interface LocationSelectRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  isEditing: boolean;
  isLoading?: boolean;
}

const LocationSelectRow = React.memo<LocationSelectRowProps>(({
  icon: Icon,
  label,
  value,
  placeholder,
  options,
  onChange,
  disabled = false,
  isEditing,
  isLoading = false,
}) => (
  <div className="flex items-start gap-3 sm:gap-4 py-3 sm:py-4 border-b border-border last:border-0">
    <div className="p-1.5 sm:p-2 bg-muted rounded-lg shrink-0">
      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs sm:text-sm font-medium text-muted-foreground">{label}</p>
      {isEditing ? (
        isLoading ? (
          <Skeleton className="h-9 w-full mt-1" />
        ) : (
          <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className="mt-1 h-9 text-sm">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      ) : (
        <p className="text-sm sm:text-base text-foreground truncate">{value || 'No especificado'}</p>
      )}
    </div>
  </div>
));

LocationSelectRow.displayName = 'LocationSelectRow';

// ============= MAIN COMPONENT =============

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  fullName,
  email,
  phone,
  department,
  city,
  onSave,
}) => {
  const { toast } = useToast();
  const { departments, getMunicipalities, isLoading: isLoadingLocations } = useColombiaLocations();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Snapshot of data when entering edit mode - completely isolated from parent re-renders
  const snapshotRef = useRef<PersonalData | null>(null);
  
  // Form state - only changes via user input or explicit actions
  const [formData, setFormData] = useState<PersonalData>({
    fullName: '',
    whatsappE164: '',
    department: '',
    city: '',
  });

  // Start editing: capture current props as snapshot and populate form
  const handleStartEditing = useCallback(() => {
    const snapshot: PersonalData = {
      fullName: fullName || '',
      whatsappE164: phone || '',
      department: department || '',
      city: city || '',
    };
    snapshotRef.current = snapshot;
    setFormData(snapshot);
    setIsEditing(true);
  }, [fullName, phone, department, city]);

  // Memoized field change handler - stable reference
  const handleFieldChange = useCallback((fieldKey: keyof PersonalData, value: string) => {
    setFormData(prev => ({ ...prev, [fieldKey]: value }));
  }, []);

  // Get municipalities for selected department
  const availableCities = useMemo(() => {
    if (!formData.department) return [];
    return getMunicipalities(formData.department);
  }, [formData.department, getMunicipalities]);

  const handleDepartmentChange = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      department: value,
      city: '', // Reset city when department changes
    }));
  }, []);

  const handleCityChange = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      city: value,
    }));
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      toast({
        title: 'Información actualizada',
        description: 'Tus datos personales han sido guardados.',
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la información.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [formData, onSave, toast]);

  const handleCancel = useCallback(() => {
    // Restore from snapshot taken when editing started
    if (snapshotRef.current) {
      setFormData(snapshotRef.current);
    }
    setIsEditing(false);
  }, []);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">
        <div>
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Información Personal
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Tu información de contacto y datos personales
          </CardDescription>
        </div>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={handleStartEditing} className="w-full sm:w-auto">
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isSaving} className="flex-1 sm:flex-initial">
              <X className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Cancelar</span>
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving} className="flex-1 sm:flex-initial">
              {isSaving ? (
                <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 sm:mr-2" />
              )}
              <span className="hidden sm:inline">Guardar</span>
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-0">
        <InfoRow 
          icon={User} 
          label="Nombre completo" 
          value={isEditing ? formData.fullName : (fullName || '')}
          isEditing={isEditing}
          fieldKey="fullName"
          placeholder="Tu nombre completo"
          onChange={handleFieldChange}
        />
        <InfoRow 
          icon={Mail} 
          label="Correo electrónico" 
          value={email}
          isEditing={false}
        />
        <InfoRow 
          icon={Phone} 
          label="WhatsApp / Teléfono" 
          value={isEditing ? formData.whatsappE164 : (phone || '')}
          isEditing={isEditing}
          fieldKey="whatsappE164"
          placeholder="+57 300 123 4567"
          type="tel"
          onChange={handleFieldChange}
        />
        
        {/* Department Select */}
        <LocationSelectRow
          icon={MapPin}
          label="Departamento"
          value={isEditing ? formData.department : (department || '')}
          placeholder="Selecciona un departamento"
          options={departments}
          onChange={handleDepartmentChange}
          disabled={isLoadingLocations}
          isEditing={isEditing}
          isLoading={isEditing && isLoadingLocations}
        />
        
        {/* City Select */}
        <LocationSelectRow
          icon={MapPin}
          label="Ciudad"
          value={isEditing ? formData.city : (city || '')}
          placeholder={formData.department ? "Selecciona una ciudad" : "Primero selecciona un departamento"}
          options={availableCities}
          onChange={handleCityChange}
          disabled={isLoadingLocations || !formData.department}
          isEditing={isEditing}
          isLoading={isEditing && isLoadingLocations}
        />
        
      </CardContent>
    </Card>
  );
};
