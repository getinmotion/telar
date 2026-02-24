import { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useColombiaLocations } from '@/hooks/useColombiaLocations';
import { Loader2, MapPin } from 'lucide-react';

interface ColombiaLocationSelectProps {
  department: string;
  municipality: string;
  onDepartmentChange: (value: string) => void;
  onMunicipalityChange: (value: string) => void;
  showLabels?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
}

export const ColombiaLocationSelect = ({
  department,
  municipality,
  onDepartmentChange,
  onMunicipalityChange,
  showLabels = true,
  required = false,
  disabled = false,
  className = '',
  compact = false,
}: ColombiaLocationSelectProps) => {
  const { departments, getMunicipalities, isLoading, error } = useColombiaLocations();
  
  const municipalities = department ? getMunicipalities(department) : [];

  // Clear municipality when department changes
  useEffect(() => {
    if (department && municipality) {
      const validMunicipalities = getMunicipalities(department);
      if (!validMunicipalities.includes(municipality)) {
        onMunicipalityChange('');
      }
    }
  }, [department, getMunicipalities, municipality, onMunicipalityChange]);

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Error cargando ubicaciones: {error}
      </div>
    );
  }

  const selectHeight = compact ? 'h-10' : 'h-12';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Department Select */}
      <div className="space-y-2">
        {showLabels && (
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Departamento {required && <span className="text-destructive">*</span>}
          </Label>
        )}
        <Select
          value={department}
          onValueChange={onDepartmentChange}
          disabled={disabled || isLoading}
        >
          <SelectTrigger className={selectHeight}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cargando...</span>
              </div>
            ) : (
              <SelectValue placeholder="Selecciona tu departamento" />
            )}
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Municipality Select */}
      <div className="space-y-2">
        {showLabels && (
          <Label>
            Municipio {required && <span className="text-destructive">*</span>}
          </Label>
        )}
        <Select
          value={municipality}
          onValueChange={onMunicipalityChange}
          disabled={disabled || !department || isLoading}
        >
          <SelectTrigger className={selectHeight}>
            <SelectValue 
              placeholder={
                !department 
                  ? "Primero selecciona un departamento" 
                  : "Selecciona tu municipio"
              } 
            />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {municipalities.map((muni) => (
              <SelectItem key={muni} value={muni}>
                {muni}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

/**
 * Utility to format department + municipality into legacy region format
 */
export const formatRegionFromLocation = (department: string, municipality: string): string => {
  if (!department && !municipality) return '';
  if (!municipality) return department;
  if (!department) return municipality;
  return `${municipality}, ${department}`;
};

/**
 * Utility to parse legacy region string into department/municipality
 * Returns best-effort parsing - may need normalization
 */
export const parseRegionToLocation = (region: string): { department: string; municipality: string } => {
  if (!region) return { department: '', municipality: '' };
  
  // Try parsing "Municipality, Department" format
  const parts = region.split(',').map(p => p.trim());
  
  if (parts.length >= 2) {
    // Last part is likely department
    const department = parts[parts.length - 1].toUpperCase();
    const municipality = parts.slice(0, -1).join(', ').toUpperCase();
    return { department, municipality };
  }
  
  // Single value - could be department or municipality
  return { department: parts[0].toUpperCase(), municipality: '' };
};
