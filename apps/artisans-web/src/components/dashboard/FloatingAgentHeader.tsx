
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface FloatingAgentHeaderProps {
  onBack: () => void;
  language: 'en' | 'es';
}

export const FloatingAgentHeader: React.FC<FloatingAgentHeaderProps> = ({
  onBack,
  language
}) => {
  return (
    <div className="fixed top-6 left-6 right-6 z-50">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI Assistant
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-white hover:bg-white/10 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Dashboard' : 'Dashboard'}
          </Button>
        </div>
      </div>
    </div>
  );
};
