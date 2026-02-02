import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';
import { parsePrice, formatPrice, validatePrice } from '@/lib/priceUtils';

interface PriceInputProps {
  value: number | null;
  onChange: (price: number | null) => void;
  label?: string;
  placeholder?: string;
  showConfirmation?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
}

export const PriceInput: React.FC<PriceInputProps> = ({
  value,
  onChange,
  label = 'Precio (COP)',
  placeholder = '50.000',
  showConfirmation = true,
  required = false,
  className,
  id = 'price-input'
}) => {
  const [inputValue, setInputValue] = useState('');
  const [parsedPrice, setParsedPrice] = useState<number | null>(null);

  // Initialize input value from prop
  useEffect(() => {
    if (value !== null && value !== parsedPrice) {
      setInputValue(value.toString());
      setParsedPrice(value);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Parse the price
    const parsed = parsePrice(newValue);
    setParsedPrice(parsed);
    onChange(parsed);
  };

  const validation = validatePrice(parsedPrice);

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={id} className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Input
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn(
            'text-lg',
            parsedPrice !== null && validation.valid && 'border-success/50 focus:border-success',
            parsedPrice !== null && !validation.valid && 'border-destructive focus:border-destructive',
            validation.warning && 'border-warning focus:border-warning'
          )}
        />
      </div>

      {/* Confirmación visual */}
      {showConfirmation && inputValue && (
        <div className="space-y-1">
          {parsedPrice !== null && validation.valid ? (
            <div className={cn(
              'flex items-center gap-2 text-sm p-2 rounded-lg',
              validation.warning 
                ? 'bg-warning/10 text-warning' 
                : 'bg-success/10 text-success'
            )}>
              {validation.warning ? (
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium">
                  {validation.warning || `Se guardará como: ${formatPrice(parsedPrice)}`}
                </p>
                {validation.warning && (
                  <p className="text-xs opacity-80 mt-0.5">
                    Valor interpretado: {formatPrice(parsedPrice)}
                  </p>
                )}
              </div>
            </div>
          ) : parsedPrice === null && inputValue ? (
            <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <p>Ingresa un precio válido</p>
            </div>
          ) : null}
        </div>
      )}

      {/* Ejemplos de formato */}
      {!inputValue && (
        <p className="text-xs text-muted-foreground">
          Puedes escribir: 50.000 o 50000 o 50,000
        </p>
      )}
    </div>
  );
};
