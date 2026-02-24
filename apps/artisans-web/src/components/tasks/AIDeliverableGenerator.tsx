import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { AIDisclaimer } from '@/components/ui/AIDisclaimer';
import { useToast } from '@/components/ui/use-toast';
import { AgentTask } from '@/hooks/types/agentTaskTypes';
import { FileText, Download, CheckCircle, Eye, Copy, Star } from 'lucide-react';

interface AIDeliverableGeneratorProps {
  deliverable: any;
  task: AgentTask;
  collectedAnswers: Array<{question: string, answer: string}>;
  onBack: () => void;
}

export const AIDeliverableGenerator: React.FC<AIDeliverableGeneratorProps> = ({
  deliverable,
  task,
  collectedAnswers,
  onBack
}) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isViewing, setIsViewing] = useState(false);

  const translations = {
    en: {
      title: 'Professional Deliverable Generated',
      subtitle: 'Your personalized business document is ready',
      deliverableReady: 'Deliverable Ready',
      generatedFor: 'Generated for: {taskTitle}',
      basedOn: 'Based on {count} intelligent questions',
      viewContent: 'View Content',
      downloadPdf: 'Download PDF',
      copyToClipboard: 'Copy to Clipboard',
      backToDashboard: 'Back to Dashboard',
      copiedSuccess: 'Content copied to clipboard',
      downloadSuccess: 'Download started',
      qualityNote: 'This document was generated using AI based on your specific responses',
      answersSummary: 'Answers Summary',
      hideContent: 'Hide Content'
    },
    es: {
      title: 'Entregable Profesional Generado',
      subtitle: 'Tu documento empresarial personalizado está listo',
      deliverableReady: 'Entregable Listo',
      generatedFor: 'Generado para: {taskTitle}',
      basedOn: 'Basado en {count} preguntas inteligentes',
      viewContent: 'Ver Contenido',
      downloadPdf: 'Descargar PDF',
      copyToClipboard: 'Copiar al Portapapeles',
      backToDashboard: 'Volver al Dashboard',
      copiedSuccess: 'Contenido copiado al portapapeles',
      downloadSuccess: 'Descarga iniciada',
      qualityNote: 'Este documento fue generado usando IA basado en tus respuestas específicas',
      answersSummary: 'Resumen de Respuestas',
      hideContent: 'Ocultar Contenido'
    }
  };

  const t = translations[language];

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(deliverable.content);
      toast({
        title: t.copiedSuccess,
        description: language === 'en' ? 'Content has been copied' : 'El contenido ha sido copiado',
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleDownloadPdf = () => {
    // Create a simple text file download (PDF generation would require additional libraries)
    const element = document.createElement('a');
    const file = new Blob([deliverable.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${deliverable.title || task.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: t.downloadSuccess,
      description: language === 'en' ? 'File has been downloaded' : 'El archivo ha sido descargado',
    });
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
      </div>

      {/* Deliverable Info Card */}
      <Card className="p-6 border-border bg-card">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">{deliverable.title || task.title}</h3>
              <p className="text-muted-foreground mt-1">
                {t.generatedFor.replace('{taskTitle}', task.title)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {t.basedOn.replace('{count}', collectedAnswers.length.toString())}
              </p>
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">AI</span>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">{t.qualityNote}</p>
          </div>
          
          <AIDisclaimer variant="banner" context="refine" className="mt-3" />
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button 
          onClick={() => setIsViewing(!isViewing)}
          variant="outline"
          className="flex-1 min-w-0"
        >
          <Eye className="w-4 h-4 mr-2" />
          {isViewing ? t.hideContent : t.viewContent}
        </Button>
        <Button 
          onClick={handleCopyToClipboard}
          variant="outline"
          className="flex-1 min-w-0"
        >
          <Copy className="w-4 h-4 mr-2" />
          {t.copyToClipboard}
        </Button>
        <Button 
          onClick={handleDownloadPdf}
          variant="outline"
          className="flex-1 min-w-0"
        >
          <Download className="w-4 h-4 mr-2" />
          {t.downloadPdf}
        </Button>
      </div>

      {/* Content Viewer */}
      {isViewing && (
        <Card className="p-6 border-border bg-card">
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">{deliverable.title}</h4>
            <div className="prose prose-sm max-w-none text-foreground">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {deliverable.content}
              </pre>
            </div>
          </div>
        </Card>
      )}

      {/* Answers Summary */}
      <Card className="p-6 border-border bg-card">
        <h4 className="font-semibold text-foreground mb-4">{t.answersSummary}</h4>
        <div className="space-y-3">
          {collectedAnswers.map((qa, index) => (
            <div key={index} className="border-l-2 border-primary/20 pl-4">
              <p className="text-sm font-medium text-foreground">{qa.question}</p>
              <p className="text-sm text-muted-foreground mt-1">{qa.answer}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Back Button */}
      <div className="flex justify-center">
        <Button onClick={onBack} size="lg" className="bg-primary hover:bg-primary/90">
          {t.backToDashboard}
        </Button>
      </div>
    </div>
  );
};