import React from 'react';
import { ColorPickerPopover } from './ColorPickerPopover';
import { hslToHex } from '@/utils/colorUtils';

interface EditableSemanticTokenProps {
  tokenName: string;
  value: string;
  onChange: (value: string) => void;
  contrastWith?: string;
  description?: string;
}

export function EditableSemanticToken({ 
  tokenName, 
  value, 
  onChange,
  contrastWith,
  description 
}: EditableSemanticTokenProps) {
  const hexColor = hslToHex(
    ...value.split(' ').map((v, i) => 
      i === 0 ? parseInt(v) : parseInt(v.replace('%', ''))
    ) as [number, number, number]
  );

  const isForeground = tokenName.includes('foreground');

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors group">
      <div className="flex items-center gap-3 flex-1">
        <ColorPickerPopover
          label={tokenName}
          value={value}
          onChange={onChange}
          showWCAGValidation={isForeground && !!contrastWith}
          contrastBackground={contrastWith}
          size="md"
        />
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">
              --{tokenName}
            </p>
            {description && (
              <span className="text-xs text-muted-foreground">
                {description}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {value}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div 
          className="w-16 h-8 rounded border border-border shadow-sm"
          style={{ backgroundColor: hexColor }}
        />
      </div>
    </div>
  );
}
