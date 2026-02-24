import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Circle } from 'lucide-react';
import { toast } from 'sonner';

interface DictationButtonProps {
  onTranscript: (text: string) => void;
  language: 'en' | 'es';
  className?: string;
}

export const DictationButton: React.FC<DictationButtonProps> = ({
  onTranscript,
  language,
  className
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      console.warn('Speech recognition not supported in this browser');
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping recognition:', e);
        }
      }
    };
  }, []);

  const translations = {
    en: {
      notSupported: 'Voice dictation is not supported in your browser',
      started: 'Dictation activated. Speak now...',
      stopped: 'Dictation stopped',
      error: 'Error with voice dictation',
      start: 'Start dictation',
      stop: 'Stop dictation',
    },
    es: {
      notSupported: 'El dictado por voz no está soportado en tu navegador',
      started: 'Dictado activado. Habla ahora...',
      stopped: 'Dictado detenido',
      error: 'Error en el dictado por voz',
      start: 'Iniciar dictado',
      stop: 'Detener dictado',
    }
  };

  const t = translations[language];

  const startDictation = () => {
    if (!isSupported) {
      toast.error(t.notSupported);
      return;
    }

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = language === 'es' ? 'es-ES' : 'en-US';
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        toast.success(t.started, { duration: 2000 });
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        console.log('Transcript:', transcript);
        onTranscript(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        
        if (event.error !== 'aborted') {
          toast.error(`${t.error}: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        console.log('Speech recognition ended');
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (error) {
      console.error('Error starting dictation:', error);
      toast.error(t.error);
      setIsRecording(false);
    }
  };

  const stopDictation = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        toast.info(t.stopped);
      } catch (error) {
        console.error('Error stopping dictation:', error);
      }
    }
    setIsRecording(false);
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      type="button"
      variant={isRecording ? 'destructive' : 'outline'}
      size="sm"
      onClick={isRecording ? stopDictation : startDictation}
      className={className}
      title={isRecording ? t.stop : t.start}
    >
      {isRecording ? (
        <>
          <Circle className="w-4 h-4 mr-2 animate-pulse fill-current" />
          <MicOff className="w-4 h-4" />
        </>
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </Button>
  );
};
