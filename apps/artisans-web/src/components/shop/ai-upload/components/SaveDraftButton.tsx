import React from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WizardState } from '../hooks/useWizardState';
import { useSaveDraft } from '../hooks/useSaveDraft';

interface SaveDraftButtonProps {
  wizardState: WizardState;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
}

export const SaveDraftButton: React.FC<SaveDraftButtonProps> = ({
  wizardState,
  variant = 'outline',
  size = 'default',
  className = '',
  showIcon = true
}) => {
  const { saveDraft, isSavingDraft } = useSaveDraft();

  const handleSaveDraft = async () => {
    await saveDraft(wizardState);
  };

  const isDisabled = isSavingDraft || wizardState.images.length === 0;

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleSaveDraft}
      disabled={isDisabled}
      className={className}
    >
      {isSavingDraft ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Guardando...
        </>
      ) : (
        <>
          {showIcon && <Save className="w-4 h-4 mr-2" />}
          Guardar borrador
        </>
      )}
    </Button>
  );
};
