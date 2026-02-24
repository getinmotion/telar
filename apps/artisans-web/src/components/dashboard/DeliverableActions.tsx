
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Download } from 'lucide-react';
import { AgentDeliverable } from '@/hooks/useAgentDeliverables';

interface DeliverableActionsProps {
  deliverable: AgentDeliverable;
  language: 'en' | 'es';
}

export const DeliverableActions: React.FC<DeliverableActionsProps> = ({
  deliverable,
  language
}) => {
  const t = {
    en: {
      view: "View",
      download: "Download"
    },
    es: {
      view: "Ver",
      download: "Descargar"
    }
  };

  const handleView = (deliverable: AgentDeliverable) => {
    if (deliverable.content) {
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>${deliverable.title}</title></head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <h1>${deliverable.title}</h1>
              <pre style="white-space: pre-wrap;">${deliverable.content}</pre>
            </body>
          </html>
        `);
      }
    }
  };

  const handleDownload = (deliverable: AgentDeliverable) => {
    if (deliverable.content) {
      const blob = new Blob([deliverable.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${deliverable.title}.${deliverable.file_type}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex gap-2">
      {deliverable.content && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleView(deliverable)}
          className="text-xs"
        >
          <Eye className="w-3 h-3 mr-1" />
          {t[language].view}
        </Button>
      )}
      
      {(deliverable.content || deliverable.file_url) && (
        <Button
          size="sm"
          onClick={() => handleDownload(deliverable)}
          className="text-xs bg-purple-600 hover:bg-purple-700"
        >
          <Download className="w-3 h-3 mr-1" />
          {t[language].download}
        </Button>
      )}
    </div>
  );
};
