
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentCreatorProps {
  agentId: string;
  language: 'en' | 'es';
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentCreator: React.FC<DocumentCreatorProps> = ({
  agentId,
  language,
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [fileType, setFileType] = useState<'text' | 'markdown' | 'pdf'>('text');
  const [isCreating, setIsCreating] = useState(false);

  const t = {
    en: {
      createDocument: 'Create New Document',
      title: 'Document Title',
      description: 'Description',
      content: 'Content',
      fileType: 'File Type',
      cancel: 'Cancel',
      create: 'Create Document',
      download: 'Download',
      titlePlaceholder: 'Enter document title...',
      descriptionPlaceholder: 'Brief description...',
      contentPlaceholder: 'Enter document content...',
      text: 'Text',
      markdown: 'Markdown',
      pdf: 'PDF'
    },
    es: {
      createDocument: 'Crear Nuevo Documento',
      title: 'Título del Documento',
      description: 'Descripción',
      content: 'Contenido',
      fileType: 'Tipo de Archivo',
      cancel: 'Cancelar',
      create: 'Crear Documento',
      download: 'Descargar',
      titlePlaceholder: 'Ingresa el título del documento...',
      descriptionPlaceholder: 'Breve descripción...',
      contentPlaceholder: 'Ingresa el contenido del documento...',
      text: 'Texto',
      markdown: 'Markdown',
      pdf: 'PDF'
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsCreating(true);
    try {
      // Here we would normally save to the agent_deliverables table
      // For now, we'll just create a downloadable file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${fileType === 'markdown' ? 'md' : 'txt'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: language === 'es' ? 'Documento creado' : 'Document created',
        description: language === 'es' ? 'El documento se ha descargado exitosamente' : 'Document downloaded successfully'
      });

      // Reset form
      setTitle('');
      setDescription('');
      setContent('');
      setFileType('text');
      onClose();
    } catch (error) {
      console.error('Error creating document:', error);
      toast({
        title: 'Error',
        description: language === 'es' ? 'No se pudo crear el documento' : 'Could not create document',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {t[language].createDocument}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="title">{t[language].title}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t[language].titlePlaceholder}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t[language].description}</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t[language].descriptionPlaceholder}
            />
          </div>

          <div className="space-y-2">
            <Label>{t[language].fileType}</Label>
            <Select value={fileType} onValueChange={(value: 'text' | 'markdown' | 'pdf') => setFileType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">{t[language].text}</SelectItem>
                <SelectItem value="markdown">{t[language].markdown}</SelectItem>
                <SelectItem value="pdf">{t[language].pdf}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">{t[language].content}</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t[language].contentPlaceholder}
              rows={10}
              className="min-h-[200px]"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t[language].cancel}
            </Button>
            <Button type="submit" disabled={!title.trim() || !content.trim() || isCreating}>
              <Download className="w-4 h-4 mr-2" />
              {isCreating ? 'Creando...' : t[language].create}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
