import React from 'react';
import { Slider } from '@/components/ui/slider';

interface SliderInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  unit?: string;
  helpText?: string;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  value,
  onChange,
  min,
  max,
  unit = '',
  helpText
}) => {
  const formatValue = (val: number) => {
    if (unit === '$') {
      return `$${val.toLocaleString('es-CL')}`;
    }
    return `${val}${unit}`;
  };

  const getPositionLabel = () => {
    const percentage = ((value - min) / (max - min)) * 100;
    if (percentage < 33) return 'BAJO';
    if (percentage < 66) return 'MEDIO';
    return 'ALTO';
  };

  return (
    <div className="space-y-4">
      {helpText && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
      
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatValue(min)}</span>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{formatValue(value)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Posicionamiento: <span className="font-medium text-foreground">{getPositionLabel()}</span>
            </div>
          </div>
          <span>{formatValue(max)}</span>
        </div>
        
        <Slider
          value={[value]}
          onValueChange={(values) => onChange(values[0])}
          min={min}
          max={max}
          step={Math.max(1, (max - min) / 100)}
          className="py-4"
        />
        
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Económico</span>
          <span className="text-muted-foreground">Medio</span>
          <span className="text-muted-foreground">Premium</span>
        </div>
      </div>
    </div>
  );
};
