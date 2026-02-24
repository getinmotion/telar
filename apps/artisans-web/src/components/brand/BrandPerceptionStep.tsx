import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { VoiceInput } from '@/components/ui/voice-input';
import { Loader2 } from 'lucide-react';

interface BrandPerceptionData {
  years_with_brand: string;
  description_in_3_words: string;
  customer_feedback: string;
  logo_feeling: string;
  target_audience: string;
  desired_emotion: string;
}

interface BrandPerceptionStepProps {
  onComplete: (data: BrandPerceptionData) => void;
  initialData?: Partial<BrandPerceptionData>;
  currentQuestion: number; // 1, 2, or 3
}

export const BrandPerceptionStep: React.FC<BrandPerceptionStepProps> = ({
  onComplete,
  initialData = {},
  currentQuestion
}) => {
  const [formData, setFormData] = useState<BrandPerceptionData>({
    years_with_brand: initialData.years_with_brand || '',
    description_in_3_words: initialData.description_in_3_words || '',
    customer_feedback: initialData.customer_feedback || '',
    logo_feeling: initialData.logo_feeling || '',
    target_audience: initialData.target_audience || '',
    desired_emotion: initialData.desired_emotion || ''
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleVoiceTranscript = (field: keyof BrandPerceptionData, transcript: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field] ? `${prev[field]} ${transcript}` : transcript
    }));
  };

  const validateCurrentQuestion = (): boolean => {
    if (currentQuestion === 1) {
      return formData.years_with_brand.length >= 1 && formData.description_in_3_words.length >= 5;
    } else if (currentQuestion === 2) {
      return formData.customer_feedback.length >= 10 && formData.logo_feeling.length >= 10;
    } else if (currentQuestion === 3) {
      return formData.target_audience.length >= 10 && formData.desired_emotion.length >= 5;
    }
    return false;
  };

  const handleNext = async () => {
    if (!validateCurrentQuestion()) {
      return;
    }
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Smooth transition
    onComplete(formData);
    setIsProcessing(false);
  };

  const renderQuestion1 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="years_with_brand">¿Hace cuántos años tienes esta marca?</Label>
        <div className="relative">
          <Textarea
            id="years_with_brand"
            placeholder="Ej: 3 años, Recién empezando, Desde 2020..."
            value={formData.years_with_brand}
            onChange={(e) => setFormData(prev => ({ ...prev, years_with_brand: e.target.value }))}
            className="min-h-[80px] pr-12"
          />
          <div className="absolute bottom-2 right-2">
            <VoiceInput
              onTranscript={(text) => handleVoiceTranscript('years_with_brand', text)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description_in_3_words">Describe tu marca en 3 palabras</Label>
        <div className="relative">
          <Textarea
            id="description_in_3_words"
            placeholder="Ej: Auténtica, artesanal, colorida"
            value={formData.description_in_3_words}
            onChange={(e) => setFormData(prev => ({ ...prev, description_in_3_words: e.target.value }))}
            className="min-h-[80px] pr-12"
          />
          <div className="absolute bottom-2 right-2">
            <VoiceInput
              onTranscript={(text) => handleVoiceTranscript('description_in_3_words', text)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuestion2 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="customer_feedback">¿Qué dicen tus clientes sobre tu marca?</Label>
        <div className="relative">
          <Textarea
            id="customer_feedback"
            placeholder="Comentarios que has recibido de clientes o seguidores..."
            value={formData.customer_feedback}
            onChange={(e) => setFormData(prev => ({ ...prev, customer_feedback: e.target.value }))}
            className="min-h-[100px] pr-12"
          />
          <div className="absolute bottom-2 right-2">
            <VoiceInput
              onTranscript={(text) => handleVoiceTranscript('customer_feedback', text)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo_feeling">¿Qué sientes que transmite tu logo?</Label>
        <div className="relative">
          <Textarea
            id="logo_feeling"
            placeholder="Ej: Transmite calidez, parece profesional, es muy colorido..."
            value={formData.logo_feeling}
            onChange={(e) => setFormData(prev => ({ ...prev, logo_feeling: e.target.value }))}
            className="min-h-[100px] pr-12"
          />
          <div className="absolute bottom-2 right-2">
            <VoiceInput
              onTranscript={(text) => handleVoiceTranscript('logo_feeling', text)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuestion3 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="target_audience">¿A quién quieres llegar con tu marca?</Label>
        <div className="relative">
          <Textarea
            id="target_audience"
            placeholder="Describe tu público objetivo ideal..."
            value={formData.target_audience}
            onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
            className="min-h-[100px] pr-12"
          />
          <div className="absolute bottom-2 right-2">
            <VoiceInput
              onTranscript={(text) => handleVoiceTranscript('target_audience', text)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="desired_emotion">¿Qué te gustaría que la gente sienta cuando ve tu marca?</Label>
        <div className="relative">
          <Textarea
            id="desired_emotion"
            placeholder="Ej: Confianza, alegría, nostalgia, inspiración..."
            value={formData.desired_emotion}
            onChange={(e) => setFormData(prev => ({ ...prev, desired_emotion: e.target.value }))}
            className="min-h-[100px] pr-12"
          />
          <div className="absolute bottom-2 right-2">
            <VoiceInput
              onTranscript={(text) => handleVoiceTranscript('desired_emotion', text)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {currentQuestion === 1 && '📝 Tu Marca: Contexto Inicial'}
          {currentQuestion === 2 && '💬 Percepción de tu Marca'}
          {currentQuestion === 3 && '🎯 Audiencia y Emociones'}
        </CardTitle>
        <CardDescription>
          {currentQuestion === 1 && 'Cuéntanos sobre tu trayectoria con la marca'}
          {currentQuestion === 2 && '¿Cómo perciben tu marca los demás?'}
          {currentQuestion === 3 && '¿Para quién creas y qué quieres transmitir?'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentQuestion === 1 && renderQuestion1()}
        {currentQuestion === 2 && renderQuestion2()}
        {currentQuestion === 3 && renderQuestion3()}

        <div className="flex justify-end">
          <Button
            onClick={handleNext}
            disabled={!validateCurrentQuestion() || isProcessing}
            className="min-w-[120px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              'Siguiente'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
