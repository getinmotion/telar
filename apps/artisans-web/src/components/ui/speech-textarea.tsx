import React, { useRef, useState } from 'react';

export const hasSpeechSupport =
  typeof window !== 'undefined' &&
  !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

interface SpeechTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const SpeechTextarea: React.FC<SpeechTextareaProps> = ({
  value,
  onChange,
  placeholder,
  rows,
  className,
  style,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const baseRef = useRef('');

  const toggle = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    baseRef.current = value;
    const r = new SR();
    r.lang = 'es-CO';
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e: any) => {
      const transcript = Array.from(e.results as SpeechRecognitionResultList)
        .map((res: SpeechRecognitionResult) => res[0].transcript)
        .join('');
      const base = baseRef.current;
      onChange(base ? `${base} ${transcript}` : transcript);
    };
    r.onerror = () => setIsRecording(false);
    r.onend = () => setIsRecording(false);
    r.start();
    recognitionRef.current = r;
    setIsRecording(true);
  };

  const mergedStyle: React.CSSProperties = hasSpeechSupport
    ? { ...style, paddingRight: '3.5rem' }
    : { ...style };

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={className}
        style={mergedStyle}
      />
      {hasSpeechSupport && (
        <button
          type="button"
          onClick={toggle}
          title={isRecording ? 'Detener dictado' : 'Dictar'}
          className={`absolute bottom-3 right-3 flex items-center justify-center w-9 h-9 rounded-full transition-all ${
            isRecording
              ? 'bg-[#ef4444] text-white shadow-md animate-pulse'
              : 'bg-[#54433e]/8 text-[#54433e]/50 hover:bg-[#ec6d13]/15 hover:text-[#ec6d13]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isRecording ? 'stop' : 'mic'}
          </span>
        </button>
      )}
      {isRecording && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" />
          <span className="text-[10px] text-[#ef4444] font-[700]">Escuchando</span>
        </div>
      )}
    </div>
  );
};
