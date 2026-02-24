import React, { useState } from 'react';
import { CheckCircle, FileText, Lightbulb, MessageSquare, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

interface SubAgentTask {
  id: string;
  title: string;
  description: string;
  agent_id: string;
  agent_name: string;
  agent_color: string;
  type: 'form' | 'conversation' | 'checklist' | 'creative';
  steps?: any[];
  impact: 'low' | 'medium' | 'high';
  estimatedTime?: string;
}

interface SubAgentInterfaceProps {
  task: SubAgentTask;
  language: 'en' | 'es';
  onComplete: (data: any) => void;
  onClose: () => void;
  onRequestHelp?: () => void;
}

// Form Wizard Interface for configuration tasks
export const FormWizardInterface: React.FC<SubAgentInterfaceProps> = ({
  task,
  language,
  onComplete,
  onClose,
  onRequestHelp
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const translations = {
    en: {
      step: "Step",
      of: "of",
      previous: "Previous",
      next: "Next",
      complete: "Complete Task",
      close: "Close",
      requestHelp: "Request Help",
      formTitle: "Configuration Wizard"
    },
    es: {
      step: "Paso",
      of: "de",
      previous: "Anterior",
      next: "Siguiente",
      complete: "Completar Tarea",
      close: "Cerrar",
      requestHelp: "Pedir Ayuda",
      formTitle: "Asistente de Configuración"
    }
  };

  const t = translations[language];
  const steps = task.steps || [];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete(formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className={`h-10 w-10 ${task.agent_color}`}>
              <AvatarFallback className="text-white">
                <FileText className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{task.agent_name}</CardTitle>
              <p className="text-sm text-muted-foreground">{t.formTitle}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{t.step} {currentStep + 1} {t.of} {steps.length}</span>
            {task.estimatedTime && (
              <Badge variant="outline">{task.estimatedTime}</Badge>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
            <p className="text-muted-foreground">{task.description}</p>
          </div>

          {/* Step Content - Would be dynamic based on step configuration */}
          <div className="min-h-[200px] space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre del proyecto</label>
                <Input 
                  placeholder="Ingresa el nombre de tu proyecto"
                  value={formData.projectName || ''}
                  onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea 
                  placeholder="Describe tu proyecto brevemente"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onRequestHelp}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              {t.requestHelp}
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t.previous}
              </Button>
              
              {currentStep === steps.length - 1 ? (
                <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {t.complete}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  {t.next}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Creative Inspiration Interface for brand/content tasks
export const CreativeInspiration: React.FC<SubAgentInterfaceProps> = ({
  task,
  language,
  onComplete,
  onClose,
  onRequestHelp
}) => {
  const [selectedInspiration, setSelectedInspiration] = useState<string[]>([]);
  const [customIdeas, setCustomIdeas] = useState('');

  const inspirationItems = [
    { id: '1', title: 'Minimalista', preview: 'Clean, simple, elegant' },
    { id: '2', title: 'Vibrante', preview: 'Bold colors, energetic' },
    { id: '3', title: 'Profesional', preview: 'Corporate, trustworthy' },
    { id: '4', title: 'Creativo', preview: 'Artistic, unique, expressive' }
  ];

  const handleComplete = () => {
    onComplete({
      inspiration: selectedInspiration,
      customIdeas: customIdeas
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className={`h-10 w-10 ${task.agent_color}`}>
              <AvatarFallback className="text-white">
                <Lightbulb className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{task.agent_name}</CardTitle>
              <p className="text-sm text-muted-foreground">Inspiración Creativa</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
            <p className="text-muted-foreground">{task.description}</p>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Selecciona estilos que te inspiren:</h4>
            <div className="grid grid-cols-2 gap-3">
              {inspirationItems.map((item) => (
                <Card 
                  key={item.id}
                  className={`cursor-pointer transition-all border-2 ${
                    selectedInspiration.includes(item.id) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    if (selectedInspiration.includes(item.id)) {
                      setSelectedInspiration(selectedInspiration.filter(id => id !== item.id));
                    } else {
                      setSelectedInspiration([...selectedInspiration, item.id]);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <h5 className="font-medium">{item.title}</h5>
                    <p className="text-sm text-muted-foreground">{item.preview}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ideas adicionales:</label>
            <Textarea 
              placeholder="Comparte cualquier idea específica que tengas..."
              value={customIdeas}
              onChange={(e) => setCustomIdeas(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onRequestHelp}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Pedir Ayuda
            </Button>
            
            <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-1" />
              Completar Tarea
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Checklist Validator for compliance tasks
export const ChecklistValidator: React.FC<SubAgentInterfaceProps> = ({
  task,
  language,
  onComplete,
  onClose,
  onRequestHelp
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const checklistItems = [
    { id: '1', text: 'Verificar información fiscal', required: true },
    { id: '2', text: 'Revisar documentos legales', required: true },
    { id: '3', text: 'Confirmar datos de contacto', required: false },
    { id: '4', text: 'Validar términos y condiciones', required: true }
  ];

  const requiredItems = checklistItems.filter(item => item.required);
  const allRequiredChecked = requiredItems.every(item => checkedItems[item.id]);
  const progress = (Object.keys(checkedItems).filter(key => checkedItems[key]).length / checklistItems.length) * 100;

  const handleComplete = () => {
    onComplete({
      checkedItems: checkedItems,
      completedAt: new Date().toISOString()
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className={`h-10 w-10 ${task.agent_color}`}>
              <AvatarFallback className="text-white">
                <CheckCircle className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{task.agent_name}</CardTitle>
              <p className="text-sm text-muted-foreground">Lista de Verificación</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {Object.keys(checkedItems).filter(key => checkedItems[key]).length} de {checklistItems.length} completados
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
            <p className="text-muted-foreground">{task.description}</p>
          </div>

          <div className="space-y-3">
            {checklistItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                <Checkbox
                  checked={checkedItems[item.id] || false}
                  onCheckedChange={(checked) => 
                    setCheckedItems({...checkedItems, [item.id]: checked as boolean})
                  }
                />
                <div className="flex-1">
                  <span className={`${checkedItems[item.id] ? 'line-through text-muted-foreground' : ''}`}>
                    {item.text}
                  </span>
                  {item.required && (
                    <Badge variant="outline" className="ml-2 text-xs">Requerido</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onRequestHelp}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Pedir Ayuda
            </Button>
            
            <Button 
              onClick={handleComplete} 
              disabled={!allRequiredChecked}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Completar Verificación
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};