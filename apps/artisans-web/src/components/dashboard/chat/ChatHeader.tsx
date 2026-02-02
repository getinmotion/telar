
import React from 'react';
import { UnifiedAgentHeader } from './UnifiedAgentHeader';

interface ChatHeaderProps {
  agentId: string;
  language: 'en' | 'es';
  onBack?: () => void;
  showHeader?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  agentId,
  language,
  onBack,
  showHeader = true
}) => {
  return (
    <UnifiedAgentHeader
      agentId={agentId}
      language={language}
      onBack={onBack}
      variant="floating"
      showHeader={showHeader}
    />
  );
};
