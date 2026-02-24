import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepInputProps {
  step: any;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  allStepData?: Record<number, any>;
  currentStepIndex?: number;
}

export const StepInput: React.FC<StepInputProps> = ({ 
  step, 
  value, 
  onChange, 
  error,
  allStepData,
  currentStepIndex 
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const maxColors = step.maxColors || 3;
  const defaultColors = Array(maxColors).fill('#000000');
  const [colors, setColors] = useState<string[]>(value || defaultColors);
  
  // Check if this step should be rendered based on conditional logic
  const shouldRender = React.useMemo(() => {
    if (!step.conditionalOn || !allStepData) return true;
    
    const previousStepValue = allStepData[step.conditionalOn.stepIndex];
    return previousStepValue === step.conditionalOn.value;
  }, [step.conditionalOn, allStepData]);
  
  if (!shouldRender) {
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (step.inputType === 'multi-file') {
      const newFiles = [...selectedFiles, ...files].slice(0, step.maxFiles || 5);
      setSelectedFiles(newFiles);
      onChange(newFiles);
    } else {
      onChange(files[0]);
      setSelectedFiles([files[0]]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onChange(newFiles.length > 0 ? newFiles : null);
  };

  const handleColorChange = (index: number, color: string) => {
    const newColors = [...colors];
    newColors[index] = color;
    setColors(newColors);
    onChange(newColors);
  };

  const handleCheckboxChange = (option: string, checked: boolean) => {
    const currentValues = Array.isArray(value) ? value : [];
    const newValues = checked
      ? [...currentValues, option]
      : currentValues.filter((v: string) => v !== option);
    onChange(newValues);
  };

  const renderInput = () => {
    switch (step.inputType) {
      case 'text':
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={step.placeholder}
            className={cn(error && 'border-destructive')}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={step.placeholder}
            rows={5}
            className={cn(error && 'border-destructive')}
          />
        );

      case 'number':
        return (
          <div className="flex items-center gap-2">
            {step.prefix && <span className="text-muted-foreground">{step.prefix}</span>}
            <Input
              type="number"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              min={step.min}
              max={step.max}
              className={cn(error && 'border-destructive')}
            />
            {step.suffix && <span className="text-muted-foreground">{step.suffix}</span>}
          </div>
        );

      case 'file':
      case 'multi-file':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <input
                type="file"
                accept={step.accept}
                multiple={step.inputType === 'multi-file'}
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click para subir {step.inputType === 'multi-file' ? 'archivos' : 'archivo'}
                </p>
                {step.inputType === 'multi-file' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Máximo {step.maxFiles || 5} archivos
                  </p>
                )}
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {file.type.startsWith('image/') && (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'radio':
        return (
          <RadioGroup value={value} onValueChange={onChange}>
            <div className="space-y-3">
              {step.options?.map((option: string) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {step.options?.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={Array.isArray(value) && value.includes(option)}
                  onCheckedChange={(checked) => handleCheckboxChange(option, checked as boolean)}
                />
                <Label htmlFor={option} className="cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'color-picker':
        return (
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: maxColors }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Label>Color {index + 1}</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colors[index]}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                  <Input
                    value={colors[index]}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return <p className="text-muted-foreground">Tipo de input no soportado</p>;
    }
  };

  return (
    <div className="space-y-3">
      {renderInput()}
      {step.helpText && !error && (
        <p className="text-sm text-muted-foreground">{step.helpText}</p>
      )}
      {error && (
        <p className="text-sm text-destructive font-medium">{error}</p>
      )}
    </div>
  );
};
