
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DebouncedButtonProps extends React.ComponentProps<typeof Button> {
  debounceMs?: number;
  loadingText?: string;
}

export const DebouncedButton: React.FC<DebouncedButtonProps> = React.memo(({ 
  onClick, 
  children, 
  debounceMs = 300,
  loadingText = "Processing...",
  disabled,
  className,
  ...props 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isProcessing || disabled) return;
    
    setIsProcessing(true);
    
    try {
      if (onClick) {
        await onClick(event);
      }
    } catch (error) {
      console.error('Button action error:', error);
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
      }, debounceMs);
    }
  }, [onClick, disabled, isProcessing, debounceMs]);

  return (
    <Button
      {...props}
      onClick={handleClick}
      disabled={disabled || isProcessing}
      className={cn(className, isProcessing && "opacity-70")}
    >
      {isProcessing ? loadingText : children}
    </Button>
  );
});

DebouncedButton.displayName = 'DebouncedButton';
