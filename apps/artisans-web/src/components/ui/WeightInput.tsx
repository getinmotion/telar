import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type WeightUnit = 'kg' | 'gr';

interface WeightInputProps {
  /** Valor en kilogramos (lo que se guarda en BD) */
  value: number | null;
  /** Callback con el valor convertido a kilogramos */
  onChange: (valueKg: number | null) => void;
  id?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function toDisplayValue(kg: number | null, unit: WeightUnit): string {
  if (kg === null || kg === undefined) return '';
  return unit === 'gr' ? String(kg * 1000) : String(kg);
}

function toKg(raw: string, unit: WeightUnit): number | null {
  if (!raw) return null;
  const num = parseFloat(raw);
  if (isNaN(num)) return null;
  return unit === 'gr' ? num / 1000 : num;
}

export const WeightInput: React.FC<WeightInputProps> = ({
  value,
  onChange,
  id = 'weight',
  placeholder,
  className,
  disabled,
}) => {
  const [unit, setUnit] = useState<WeightUnit>('kg');
  const [displayValue, setDisplayValue] = useState<string>(
    toDisplayValue(value, 'kg')
  );

  useEffect(() => {
    setDisplayValue(toDisplayValue(value, unit));
  }, [value]);

  const handleUnitChange = (newUnit: WeightUnit) => {
    setUnit(newUnit);
    setDisplayValue(toDisplayValue(value, newUnit));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDisplayValue(raw);
    onChange(toKg(raw, unit));
  };

  const resolvedPlaceholder =
    placeholder ?? (unit === 'gr' ? 'Ej: 500' : 'Ej: 0.5');

  return (
    <div className={`flex gap-2 ${className ?? ''}`}>
      <Input
        id={id}
        type="number"
        min="0"
        step={unit === 'gr' ? '1' : '0.001'}
        value={displayValue}
        onChange={handleInputChange}
        placeholder={resolvedPlaceholder}
        disabled={disabled}
        className="flex-1"
      />
      <Select
        value={unit}
        onValueChange={(v) => handleUnitChange(v as WeightUnit)}
        disabled={disabled}
      >
        <SelectTrigger className="w-20 shrink-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="kg">Kg</SelectItem>
          <SelectItem value="gr">gr</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
