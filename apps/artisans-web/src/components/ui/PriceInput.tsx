import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/lib/utils';

interface PriceInputProps {
  /** Valor numérico en COP */
  value: number;
  /** Callback con el valor numérico limpio */
  onChange: (value: number) => void;
  id?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  min?: number;
}

export const PriceInput: React.FC<PriceInputProps> = ({
  value,
  onChange,
  id = 'price',
  placeholder = 'Ej: 25000',
  className,
  disabled,
  required,
  min = 0,
}) => {
  const [rawInput, setRawInput] = useState<string>(value > 0 ? String(value) : '');

  useEffect(() => {
    const parsed = parseInt(rawInput.replace(/\D/g, ''), 10);
    const current = isNaN(parsed) ? 0 : parsed;
    if (current !== value) {
      setRawInput(value > 0 ? String(value) : '');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^\d]/g, '');
    setRawInput(cleaned);
    const parsed = parseInt(cleaned, 10);
    onChange(isNaN(parsed) ? 0 : parsed);
  };

  const formatted = value > 0 ? formatCurrency(value) : null;

  return (
    <div className="space-y-1">
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        value={rawInput}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        min={min}
        className={cn(className)}
      />
      {formatted && (
        <p className="text-xs text-muted-foreground pl-1 tabular-nums">
          {formatted}
        </p>
      )}
    </div>
  );
};
