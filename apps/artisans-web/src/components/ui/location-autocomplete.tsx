import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Declarar tipos de Google Maps
declare global {
  interface Window {
    google: any;
    initGooglePlaces: () => void;
  }
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Ingresa tu ubicación',
  className = '',
  disabled = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGooglePlaces = async () => {
      try {
        // Check if already loaded
        if (window.google?.maps?.places) {
          initAutocomplete();
          return;
        }

        // Load Google Maps script
        const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
        
        if (!apiKey) {
          setError('API key no configurada');
          setIsLoading(false);
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=es`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          initAutocomplete();
        };
        
        script.onerror = () => {
          setError('Error al cargar Google Places');
          setIsLoading(false);
        };

        document.head.appendChild(script);
      } catch (err) {
        console.error('Error loading Google Places:', err);
        setError('Error al inicializar');
        setIsLoading(false);
      }
    };

    const initAutocomplete = () => {
      if (!inputRef.current || !window.google?.maps?.places) {
        return;
      }

      try {
        // Crear autocomplete con opciones para priorizar ciudades y países
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ['(cities)'], // Priorizar ciudades
            componentRestrictions: {}, // Sin restricción de país
            fields: ['address_components', 'formatted_address', 'geometry', 'name']
          }
        );

        // Escuchar cambios
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          
          if (place.formatted_address) {
            onChange(place.formatted_address);
          } else if (place.name) {
            onChange(place.name);
          }
        });

        setIsLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error initializing autocomplete:', err);
        setError('Error al inicializar búsqueda');
        setIsLoading(false);
      }
    };

    loadGooglePlaces();

    return () => {
      // Cleanup
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={className}>
      {label && <Label>{label}</Label>}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className="pl-9"
        />
      </div>
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
      {isLoading && (
        <p className="text-sm text-muted-foreground mt-1">Cargando...</p>
      )}
    </div>
  );
};
