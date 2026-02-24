import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Building, Target, Clock, Users, TrendingUp, MapPin } from 'lucide-react';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';
import { useUnifiedUserData } from '@/hooks/user/useUnifiedUserData';

interface BusinessProfileCaptureProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const BusinessProfileCapture: React.FC<BusinessProfileCaptureProps> = ({ onComplete, onSkip }) => {
  const { user } = useAuth();
  const { updateProfile } = useUnifiedUserData();
  const { toast } = useToast();
  const userLocalStorage = useUserLocalStorage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    business_description: '',
    brand_name: '',
    business_type: '',
    target_market: '',
    current_stage: '',
    business_goals: [] as string[],
    monthly_revenue_goal: '',
    time_availability: '',
    team_size: '',
    current_challenges: [] as string[],
    sales_channels: [] as string[],
    business_location: '',
    years_in_business: '',
    initial_investment_range: '',
    primary_skills: [] as string[]
  });

  const businessTypes = [
    'artisan', 'services', 'ecommerce', 'saas', 'consulting', 
    'retail', 'content', 'manufacturing', 'restaurant', 'other'
  ];

  const businessStages = [
    'idea', 'mvp', 'early', 'growth', 'established'
  ];

  const businessGoals = [
    'increase_revenue', 'scale_operations', 'automate_processes', 
    'expand_market', 'improve_efficiency', 'build_brand', 'reduce_costs'
  ];

  const salesChannels = [
    'instagram', 'facebook', 'whatsapp', 'website', 'marketplace', 
    'physical_store', 'word_of_mouth', 'email', 'tiktok', 'linkedin'
  ];

  const challenges = [
    'pricing', 'marketing', 'time_management', 'competition', 
    'customer_acquisition', 'financial_management', 'technology', 'legal_issues'
  ];

  const skills = [
    'design', 'programming', 'marketing', 'sales', 'finance', 
    'leadership', 'communication', 'project_management', 'data_analysis'
  ];

  const handleMultiSelect = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field as keyof typeof prev] as string[], value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Update profile using unified hook with camelCase field names
      const result = await updateProfile({
        businessDescription: formData.business_description,
        brandName: formData.brand_name,
        businessType: formData.business_type,
        targetMarket: formData.target_market,
        currentStage: formData.current_stage,
        businessGoals: formData.business_goals,
        monthlyRevenueGoal: formData.monthly_revenue_goal ? parseInt(formData.monthly_revenue_goal) : undefined,
        timeAvailability: formData.time_availability,
        teamSize: formData.team_size,
        currentChallenges: formData.current_challenges,
        salesChannels: formData.sales_channels,
        businessLocation: formData.business_location,
        yearsInBusiness: formData.years_in_business ? parseInt(formData.years_in_business) : undefined,
        initialInvestmentRange: formData.initial_investment_range,
        primarySkills: formData.primary_skills,
      });

      if (!result.success) throw new Error(result.error || 'Error updating profile');

      toast({
        title: "✅ Perfil de negocio guardado",
        description: "Tu información ha sido almacenada correctamente. Ahora podremos personalizar tu experiencia."
      });

      // Guardar en localStorage con namespace de usuario
      userLocalStorage.setItem('business_profile_captured', JSON.stringify(formData));
      
      onComplete();
    } catch (error) {
      console.error('Error saving business profile:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo guardar tu perfil. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Building className="w-12 h-12 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">Cuéntanos sobre tu negocio</h2>
        <p className="text-muted-foreground">Esta información nos ayudará a personalizar completamente tu experiencia</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">¿A qué te dedicas? Describe tu negocio</label>
          <Textarea
            placeholder="Ej: Pinto chaquetas de cuero personalizadas con diseños únicos para motociclistas..."
            value={formData.business_description}
            onChange={(e) => setFormData(prev => ({ ...prev, business_description: e.target.value }))}
            className="min-h-[100px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Nombre de tu marca/negocio</label>
          <Input
            placeholder="Ej: LeatherArt Custom, Mi Consultoría, etc."
            value={formData.brand_name}
            onChange={(e) => setFormData(prev => ({ ...prev, brand_name: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tipo de negocio</label>
          <Select value={formData.business_type} onValueChange={(value) => setFormData(prev => ({ ...prev, business_type: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el tipo de negocio" />
            </SelectTrigger>
            <SelectContent>
              {businessTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type === 'artisan' && 'Artesano/Manualidades'}
                  {type === 'services' && 'Servicios profesionales'}
                  {type === 'ecommerce' && 'Comercio electrónico'}
                  {type === 'saas' && 'Software/Tecnología'}
                  {type === 'consulting' && 'Consultoría'}
                  {type === 'retail' && 'Venta al detalle'}
                  {type === 'content' && 'Creación de contenido'}
                  {type === 'manufacturing' && 'Manufactura'}
                  {type === 'restaurant' && 'Restaurante/Comida'}
                  {type === 'other' && 'Otro'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Target className="w-12 h-12 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">Situación actual</h2>
        <p className="text-muted-foreground">Conocer tu etapa nos permite darte el apoyo adecuado</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">¿En qué etapa está tu negocio?</label>
          <Select value={formData.current_stage} onValueChange={(value) => setFormData(prev => ({ ...prev, current_stage: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tu etapa actual" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="idea">Solo es una idea</SelectItem>
              <SelectItem value="mvp">Producto mínimo viable</SelectItem>
              <SelectItem value="early">Primeras ventas/clientes</SelectItem>
              <SelectItem value="growth">En crecimiento</SelectItem>
              <SelectItem value="established">Establecido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">¿Cuánto tiempo llevas en esto?</label>
          <Input
            type="number"
            placeholder="Años en el negocio"
            value={formData.years_in_business}
            onChange={(e) => setFormData(prev => ({ ...prev, years_in_business: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">¿Dónde está ubicado tu negocio?</label>
          <Input
            placeholder="Ciudad, País"
            value={formData.business_location}
            onChange={(e) => setFormData(prev => ({ ...prev, business_location: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tamaño de tu equipo</label>
          <Select value={formData.team_size} onValueChange={(value) => setFormData(prev => ({ ...prev, team_size: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="¿Trabajas solo o en equipo?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solo">Solo yo</SelectItem>
              <SelectItem value="small">2-5 personas</SelectItem>
              <SelectItem value="medium">6-20 personas</SelectItem>
              <SelectItem value="large">Más de 20 personas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <TrendingUp className="w-12 h-12 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">Objetivos y metas</h2>
        <p className="text-muted-foreground">¿Hacia dónde quieres llevar tu negocio?</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">¿Cuáles son tus principales objetivos? (selecciona varios)</label>
          <div className="grid grid-cols-2 gap-2">
            {businessGoals.map(goal => (
              <label key={goal} className="flex items-center space-x-2 p-2 border rounded hover:bg-accent cursor-pointer">
                <Checkbox
                  checked={formData.business_goals.includes(goal)}
                  onCheckedChange={(checked) => handleMultiSelect('business_goals', goal, checked as boolean)}
                />
                <span className="text-sm">
                  {goal === 'increase_revenue' && 'Aumentar ingresos'}
                  {goal === 'scale_operations' && 'Escalar operaciones'}
                  {goal === 'automate_processes' && 'Automatizar procesos'}
                  {goal === 'expand_market' && 'Expandir mercado'}
                  {goal === 'improve_efficiency' && 'Mejorar eficiencia'}
                  {goal === 'build_brand' && 'Construir marca'}
                  {goal === 'reduce_costs' && 'Reducir costos'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Meta de ingresos mensuales (opcional)</label>
          <Input
            type="number"
            placeholder="Ej: 5000"
            value={formData.monthly_revenue_goal}
            onChange={(e) => setFormData(prev => ({ ...prev, monthly_revenue_goal: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">¿Cuánto tiempo puedes dedicar?</label>
          <Select value={formData.time_availability} onValueChange={(value) => setFormData(prev => ({ ...prev, time_availability: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Disponibilidad de tiempo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="part_time">Tiempo parcial (pocas horas)</SelectItem>
              <SelectItem value="full_time">Tiempo completo</SelectItem>
              <SelectItem value="weekends">Solo fines de semana</SelectItem>
              <SelectItem value="flexible">Horario flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <MapPin className="w-12 h-12 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">Canales y desafíos</h2>
        <p className="text-muted-foreground">¿Cómo vendes y qué te está costando trabajo?</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">¿Dónde vendes actualmente? (selecciona varios)</label>
          <div className="grid grid-cols-2 gap-2">
            {salesChannels.map(channel => (
              <label key={channel} className="flex items-center space-x-2 p-2 border rounded hover:bg-accent cursor-pointer">
                <Checkbox
                  checked={formData.sales_channels.includes(channel)}
                  onCheckedChange={(checked) => handleMultiSelect('sales_channels', channel, checked as boolean)}
                />
                <span className="text-sm capitalize">{channel.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">¿Cuáles son tus principales desafíos? (selecciona varios)</label>
          <div className="grid grid-cols-2 gap-2">
            {challenges.map(challenge => (
              <label key={challenge} className="flex items-center space-x-2 p-2 border rounded hover:bg-accent cursor-pointer">
                <Checkbox
                  checked={formData.current_challenges.includes(challenge)}
                  onCheckedChange={(checked) => handleMultiSelect('current_challenges', challenge, checked as boolean)}
                />
                <span className="text-sm">
                  {challenge === 'pricing' && 'Definir precios'}
                  {challenge === 'marketing' && 'Marketing'}
                  {challenge === 'time_management' && 'Gestión del tiempo'}
                  {challenge === 'competition' && 'Competencia'}
                  {challenge === 'customer_acquisition' && 'Conseguir clientes'}
                  {challenge === 'financial_management' && 'Finanzas'}
                  {challenge === 'technology' && 'Tecnología'}
                  {challenge === 'legal_issues' && 'Aspectos legales'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">¿Cuáles son tus fortalezas? (selecciona varias)</label>
          <div className="grid grid-cols-2 gap-2">
            {skills.map(skill => (
              <label key={skill} className="flex items-center space-x-2 p-2 border rounded hover:bg-accent cursor-pointer">
                <Checkbox
                  checked={formData.primary_skills.includes(skill)}
                  onCheckedChange={(checked) => handleMultiSelect('primary_skills', skill, checked as boolean)}
                />
                <span className="text-sm">
                  {skill === 'design' && 'Diseño'}
                  {skill === 'programming' && 'Programación'}
                  {skill === 'marketing' && 'Marketing'}
                  {skill === 'sales' && 'Ventas'}
                  {skill === 'finance' && 'Finanzas'}
                  {skill === 'leadership' && 'Liderazgo'}
                  {skill === 'communication' && 'Comunicación'}
                  {skill === 'project_management' && 'Gestión de proyectos'}
                  {skill === 'data_analysis' && 'Análisis de datos'}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Perfil de Negocio</CardTitle>
          <div className="flex space-x-1">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Anterior
            </Button>
          )}
          
          <div className="flex space-x-2 ml-auto">
            {onSkip && step === 1 && (
              <Button variant="ghost" onClick={onSkip}>
                Saltar por ahora
              </Button>
            )}
            
            {step < 4 ? (
              <Button 
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !formData.business_description}
              >
                Siguiente
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={loading || !formData.business_description}
              >
                {loading ? 'Guardando...' : 'Completar perfil'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};