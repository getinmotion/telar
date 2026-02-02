import React, { useState, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  language?: 'es' | 'en';
  className?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  language = 'es',
  className
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: language === 'es' ? 'Error de micrófono' : 'Microphone error',
        description: language === 'es'
          ? 'No se pudo acceder al micrófono. Verifica los permisos.'
          : 'Could not access microphone. Check permissions.',
        variant: 'destructive'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: {
            audio: base64Audio,
            language: language === 'es' ? 'es' : 'en'
          }
        });

        if (error) throw error;
        
        if (data?.text) {
          onTranscript(data.text);
        }
        
        setIsProcessing(false);
      };
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: language === 'es' ? 'Error de transcripción' : 'Transcription error',
        description: language === 'es'
          ? 'No se pudo transcribir el audio. Intenta de nuevo.'
          : 'Could not transcribe audio. Try again.',
        variant: 'destructive'
      });
      setIsProcessing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="relative inline-flex items-center gap-2 group">
      {/* Recording waves animation */}
      {isRecording && (
        <>
          <div 
            className="absolute inset-0 -m-1 rounded-full bg-destructive/20 animate-ping pointer-events-none" 
            style={{ animationDelay: '0ms' }}
          />
          <div 
            className="absolute inset-0 -m-2 rounded-full bg-destructive/15 animate-ping pointer-events-none" 
            style={{ animationDelay: '300ms' }}
          />
          <div 
            className="absolute inset-0 -m-3 rounded-full bg-destructive/10 animate-ping pointer-events-none" 
            style={{ animationDelay: '600ms' }}
          />
        </>
      )}
      
      <Button
        type="button"
        variant={isRecording ? "destructive" : "outline"}
        size="icon"
        onClick={toggleRecording}
        disabled={isProcessing}
        className={`w-14 h-14 shadow-md hover:shadow-lg transition-all ${className}`}
        title={language === 'es' ? 'Dictado por voz' : 'Voice dictation'}
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isRecording ? (
          <Mic className="w-5 h-5 animate-pulse" />
        ) : (
          <MicOff className="w-5 h-5" />
        )}
      </Button>
      
      {!isRecording && !isProcessing && (
        <span className="text-xs text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          💬 {language === 'es' ? 'Dictando es más fácil' : 'Dictating is easier'}
        </span>
      )}
    </div>
  );
};
