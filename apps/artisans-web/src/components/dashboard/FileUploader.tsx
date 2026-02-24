
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Upload, File, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploaderProps {
  language: 'en' | 'es';
  isOpen: boolean;
  onClose: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  language,
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    en: {
      uploadFiles: 'Upload Files',
      selectFiles: 'Select Files',
      dragDrop: 'Drag and drop files here or click to select',
      cancel: 'Cancel',
      upload: 'Upload',
      maxSize: 'Max 10MB per file',
      removeFile: 'Remove file',
      noFiles: 'No files selected'
    },
    es: {
      uploadFiles: 'Subir Archivos',
      selectFiles: 'Seleccionar Archivos',
      dragDrop: 'Arrastra archivos aquí o haz clic para seleccionar',
      cancel: 'Cancelar',
      upload: 'Subir',
      maxSize: 'Máx 10MB por archivo',
      removeFile: 'Eliminar archivo',
      noFiles: 'No hay archivos seleccionados'
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024); // 10MB limit
    
    if (validFiles.length !== files.length) {
      toast({
        title: 'Warning',
        description: language === 'es' ? 'Algunos archivos son demasiado grandes (máx 10MB)' : 'Some files are too large (max 10MB)',
        variant: 'destructive'
      });
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      // Simulate file upload - in a real app, this would upload to Supabase Storage
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: language === 'es' ? 'Archivos subidos' : 'Files uploaded',
        description: language === 'es' 
          ? `${selectedFiles.length} archivo(s) subido(s) exitosamente` 
          : `${selectedFiles.length} file(s) uploaded successfully`
      });

      setSelectedFiles([]);
      onClose();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: 'Error',
        description: language === 'es' ? 'No se pudieron subir los archivos' : 'Could not upload files',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            {t[language].uploadFiles}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 mb-1">{t[language].dragDrop}</p>
            <p className="text-xs text-gray-500">{t[language].maxSize}</p>
            <Input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="*/*"
            />
          </div>

          {selectedFiles.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <Label>Selected Files ({selectedFiles.length})</Label>
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <File className="w-4 h-4 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    title={t[language].removeFile}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-gray-500">{t[language].noFiles}</p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t[language].cancel}
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={selectedFiles.length === 0 || isUploading}
          >
            {isUploading ? 'Subiendo...' : t[language].upload}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
