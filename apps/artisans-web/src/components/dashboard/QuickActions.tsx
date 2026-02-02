
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { 
  FileText, 
  Download, 
  Share2,
  ExternalLink 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const QuickActions = () => {
  const { language } = useLanguage();
  
  const translations = {
    en: {
      quickActions: "Quick Actions",
      documents: "Documents",
      onePager: "One Pager",
      downloadPortfolio: "Download Portfolio",
      shareProject: "Share Project",
      new: "NEW"
    },
    es: {
      quickActions: "Acciones Rápidas",
      documents: "Documentos",
      onePager: "One Pager",
      downloadPortfolio: "Descargar Portfolio",
      shareProject: "Compartir Proyecto",
      new: "NUEVO"
    }
  };
  
  const t = translations[language];
  
  return (
    <div className="bg-background p-5 rounded-xl border border-border shadow-sm">
      <h3 className="text-lg font-medium mb-4">{t.quickActions}</h3>
      
      <div className="space-y-3">
        <Link to="/one-pager" className="flex items-center justify-between p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
              <FileText className="w-4 h-4" />
            </div>
            <span>{t.onePager}</span>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
        </Link>
        
        <button className="w-full flex items-center justify-between p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center mr-3">
              <Download className="w-4 h-4" />
            </div>
            <span>{t.downloadPortfolio}</span>
          </div>
        </button>
        
        <button className="w-full flex items-center justify-between p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mr-3">
              <Share2 className="w-4 h-4" />
            </div>
            <span>{t.shareProject}</span>
          </div>
        </button>
      </div>
    </div>
  );
};
