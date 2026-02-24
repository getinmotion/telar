import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Edit2, Loader2, Sparkles, Pencil, Bot, User, Save, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { LocationAutocomplete } from '@/components/ui/location-autocomplete';
import { ClasificacionOficial, TecnicaOficial } from '@/types/artisan';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface ExtractedInfo {
  brand_name: string;
  craft_type: string;
  business_location: string;
  unique_value: string;
  confidence: number;
}

interface BusinessInfoConfirmationProps {
  extractedInfo: ExtractedInfo;
  language: 'en' | 'es';
  onConfirm: (confirmedData: ExtractedInfo) => void;
  onEdit?: () => void;
  classification?: ClasificacionOficial | null;
  onClassify?: (description: string) => Promise<ClasificacionOficial | null>;
  isClassifying?: boolean;
  businessDescription?: string;
}

export const BusinessInfoConfirmation: React.FC<BusinessInfoConfirmationProps> = ({
  extractedInfo,
  language,
  onConfirm,
  onEdit,
  classification,
  onClassify,
  isClassifying = false,
  businessDescription
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ExtractedInfo>(extractedInfo);
  const [localClassification, setLocalClassification] = useState<ClasificacionOficial | null>(classification || null);
  const [isClassifyingLocal, setIsClassifyingLocal] = useState(false);
  
  // 🔍 Validar qué campos están completos
  const isFieldComplete = (value: string | undefined) => {
    if (!value) return false;
    const lowerValue = value.toLowerCase();
    return lowerValue !== 'sin nombre definido' && 
           lowerValue !== 'no name defined' &&
           lowerValue !== 'sin definir' &&
           lowerValue.trim().length > 0;
  };
  
  const brandNameComplete = isFieldComplete(editedData.brand_name);
  const craftTypeComplete = isFieldComplete(editedData.craft_type);
  const locationComplete = isFieldComplete(editedData.business_location);
  const uniqueValueComplete = isFieldComplete(editedData.unique_value);
  
  // Los 3 campos críticos son: craft_type, location, unique_value
  // El brand_name puede quedar como "Sin nombre definido"
  const canProceed = craftTypeComplete && locationComplete && uniqueValueComplete;
  
  // Classification states
  const [classificationMode, setClassificationMode] = useState<'auto' | 'manual'>('auto');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [manualClassification, setManualClassification] = useState<Partial<ClasificacionOficial>>({
    oficio: '',
    materiaPrima: '',
    codigoOficioCUOC: '',
    codigoOficioAdeC: '',
    codigoMateriaPrimaCUOC: '',
    codigoMateriaPrimaAdeC: '',
    tecnicas: [],
    justificacion: ''
  });

  const translations = {
    es: {
      title: '¿Es correcta esta información?',
      subtitle: 'Revisa que entendimos bien tu negocio',
      brandName: 'Nombre de tu marca',
      craftType: 'Tipo de artesanía',
      location: 'Ubicación',
      uniqueValue: 'Lo que te hace único',
      confirm: 'Sí, es correcto',
      edit: 'Editar',
      saveChanges: 'Guardar cambios',
      cancel: 'Cancelar',
      required: 'Requerido',
      complete: 'Completo',
      missingFields: 'Faltan campos importantes',
      completeRequired: 'Por favor completa los campos marcados antes de continuar. Puedes editarlos haciendo click en el botón Editar.',
      completeFieldsFirst: 'Completa los campos requeridos',
      classificationTitle: '🎨 Clasificación Oficial de tu Oficio Artesanal',
      classificationSubtitle: 'Esta clasificación nos ayuda a darte recomendaciones más específicas según el catálogo oficial de oficios artesanales de Colombia',
      autoMode: '🤖 Automático con IA',
      manualMode: '✏️ Manual',
      classifyButton: 'Clasificar Automáticamente',
      classificationSuccess: '¡Clasificado exitosamente!',
      oficio: 'Oficio',
      materiaPrima: 'Materia Prima',
      tecnicas: 'Técnicas',
      codigoCUOC: 'Código CUOC',
      codigoAdeC: 'Código AdeC',
      justificacion: 'Justificación',
      confidence: 'Confianza',
      editField: 'Editar',
      saveField: 'Guardar',
      cancelEdit: 'Cancelar',
      manualEntry: 'Ingresa manualmente los datos de clasificación'
    },
    en: {
      title: 'Is this information correct?',
      subtitle: 'Review that we understood your business',
      brandName: 'Your brand name',
      craftType: 'Type of craft',
      location: 'Location',
      uniqueValue: 'What makes you unique',
      confirm: 'Yes, correct',
      edit: 'Edit',
      saveChanges: 'Save',
      cancel: 'Cancel',
      required: 'Required',
      complete: 'Complete',
      missingFields: 'Missing important fields',
      completeRequired: 'Please complete the marked fields before continuing. You can edit them by clicking the Edit button.',
      completeFieldsFirst: 'Complete required fields',
      classificationTitle: '🎨 Official Artisan Craft Classification',
      classificationSubtitle: 'This classification helps us give you more specific recommendations according to the official Colombian artisan crafts catalog',
      autoMode: '🤖 Automatic with AI',
      manualMode: '✏️ Manual',
      classifyButton: 'Classify Automatically',
      classificationSuccess: 'Successfully classified!',
      oficio: 'Craft',
      materiaPrima: 'Material',
      tecnicas: 'Techniques',
      codigoCUOC: 'CUOC Code',
      codigoAdeC: 'AdeC Code',
      justificacion: 'Justification',
      confidence: 'Confidence',
      editField: 'Edit',
      saveField: 'Save',
      cancelEdit: 'Cancel',
      manualEntry: 'Manually enter classification data'
    }
  };

  const t = translations[language];

  const handleClassify = async () => {
    if (!onClassify || !businessDescription) return;
    setIsClassifyingLocal(true);
    try {
      const result = await onClassify(businessDescription);
      if (result) {
        setLocalClassification(result);
      }
    } finally {
      setIsClassifyingLocal(false);
    }
  };

  const handleManualClassify = () => {
    const newClassification: ClasificacionOficial = {
      ...manualClassification as ClasificacionOficial,
      confianza: 1.0,
      fechaClasificacion: new Date(),
      clasificadoAutomaticamente: false,
      clasificadoPorUsuario: true
    };
    setLocalClassification(newClassification);
  };

  const handleFieldEdit = (field: string, value: any) => {
    if (!localClassification) return;
    setLocalClassification({
      ...localClassification,
      [field]: value,
      clasificadoPorUsuario: true
    });
    setEditingField(null);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">{t.title}</h2>
        <p className="text-muted-foreground text-lg">{t.subtitle}</p>
      </div>

      {/* CLASSIFICATION SECTION - MEGA PROMINENT */}
      {onClassify && (
        <Card className="p-8 border-4 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-2xl">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <Sparkles className="w-16 h-16 text-primary animate-pulse" />
              </div>
              <h3 className="text-3xl font-bold">{t.classificationTitle}</h3>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                {t.classificationSubtitle}
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex justify-center">
              <ToggleGroup 
                type="single" 
                value={classificationMode} 
                onValueChange={(value) => value && setClassificationMode(value as 'auto' | 'manual')}
                className="bg-background/50 p-2 rounded-lg border-2 border-primary/20"
              >
                <ToggleGroupItem value="auto" className="text-base px-6 py-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  <Bot className="w-5 h-5 mr-2" />
                  {t.autoMode}
                </ToggleGroupItem>
                <ToggleGroupItem value="manual" className="text-base px-6 py-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  <User className="w-5 h-5 mr-2" />
                  {t.manualMode}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Classification Content */}
            {classificationMode === 'auto' ? (
              // AUTOMATIC MODE
              <div className="space-y-6">
                {!localClassification?.oficio ? (
                  <Button 
                    onClick={handleClassify} 
                    disabled={isClassifyingLocal || isClassifying} 
                    size="lg" 
                    className="w-full h-16 text-xl font-bold"
                  >
                    {isClassifyingLocal || isClassifying ? (
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-6 h-6 mr-3" />
                    )}
                    {t.classifyButton}
                  </Button>
                ) : (
                  // CLASSIFIED - SHOW ALL FIELDS
                  <div className="space-y-6 p-6 bg-background/80 rounded-xl border-2 border-primary/20">
                    <div className="flex items-center gap-3 pb-4 border-b-2 border-primary/20">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                      <h4 className="text-2xl font-bold">{t.classificationSuccess}</h4>
                    </div>

                    {/* Confidence Bar */}
                    {localClassification.confianza && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-base font-semibold">{t.confidence}</Label>
                          <Badge variant="secondary" className="text-lg px-4 py-1">
                            {Math.round(localClassification.confianza * 100)}%
                          </Badge>
                        </div>
                        <Progress value={localClassification.confianza * 100} className="h-3" />
                      </div>
                    )}

                    {/* Oficio */}
                    <div className="space-y-2 p-4 bg-background rounded-lg border border-border">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Label className="text-sm font-semibold text-muted-foreground">{t.oficio}</Label>
                          {editingField === 'oficio' ? (
                            <Input 
                              defaultValue={localClassification.oficio}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleFieldEdit('oficio', e.currentTarget.value);
                                if (e.key === 'Escape') setEditingField(null);
                              }}
                              autoFocus
                              className="mt-2"
                            />
                          ) : (
                            <p className="text-lg font-bold mt-1">{localClassification.oficio}</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          {editingField === 'oficio' ? (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => setEditingField(null)}>
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => setEditingField('oficio')}>
                              <Edit2 className="w-4 h-4 mr-1" />
                              {t.editField}
                            </Button>
                          )}
                        </div>
                      </div>
                      {localClassification.codigoOficioCUOC && (
                        <div className="flex gap-4 mt-2">
                          <Badge variant="outline">{t.codigoCUOC}: {localClassification.codigoOficioCUOC}</Badge>
                          {localClassification.codigoOficioAdeC && (
                            <Badge variant="outline">{t.codigoAdeC}: {localClassification.codigoOficioAdeC}</Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Materia Prima */}
                    <div className="space-y-2 p-4 bg-background rounded-lg border border-border">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Label className="text-sm font-semibold text-muted-foreground">{t.materiaPrima}</Label>
                          {editingField === 'materiaPrima' ? (
                            <Input 
                              defaultValue={localClassification.materiaPrima}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleFieldEdit('materiaPrima', e.currentTarget.value);
                                if (e.key === 'Escape') setEditingField(null);
                              }}
                              autoFocus
                              className="mt-2"
                            />
                          ) : (
                            <p className="text-lg font-bold mt-1">{localClassification.materiaPrima}</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          {editingField === 'materiaPrima' ? (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => setEditingField(null)}>
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => setEditingField('materiaPrima')}>
                              <Edit2 className="w-4 h-4 mr-1" />
                              {t.editField}
                            </Button>
                          )}
                        </div>
                      </div>
                      {localClassification.codigoMateriaPrimaCUOC && (
                        <div className="flex gap-4 mt-2">
                          <Badge variant="outline">{t.codigoCUOC}: {localClassification.codigoMateriaPrimaCUOC}</Badge>
                          {localClassification.codigoMateriaPrimaAdeC && (
                            <Badge variant="outline">{t.codigoAdeC}: {localClassification.codigoMateriaPrimaAdeC}</Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Técnicas */}
                    {localClassification.tecnicas && localClassification.tecnicas.length > 0 && (
                      <div className="space-y-2 p-4 bg-background rounded-lg border border-border">
                        <Label className="text-sm font-semibold text-muted-foreground">{t.tecnicas}</Label>
                        <div className="space-y-2 mt-2">
                          {localClassification.tecnicas.map((tecnica, idx) => (
                            <div key={idx} className="p-3 bg-muted/50 rounded-md">
                              <p className="font-semibold">{tecnica.nombre}</p>
                              {tecnica.codigoTecnicaAdeC && (
                                <Badge variant="outline" className="mt-1">
                                  {t.codigoAdeC}: {tecnica.codigoTecnicaAdeC}
                                </Badge>
                              )}
                              {tecnica.definicion && (
                                <p className="text-sm text-muted-foreground mt-2">{tecnica.definicion}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Justificación */}
                    {localClassification.justificacion && (
                      <div className="space-y-2 p-4 bg-background rounded-lg border border-border">
                        <Label className="text-sm font-semibold text-muted-foreground">{t.justificacion}</Label>
                        <p className="text-base mt-1 leading-relaxed">{localClassification.justificacion}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // MANUAL MODE
              <div className="space-y-4 p-6 bg-background/80 rounded-xl border-2 border-primary/20">
                <p className="text-center text-muted-foreground mb-4">{t.manualEntry}</p>
                
                <div className="space-y-4">
                  <div>
                    <Label>{t.oficio}</Label>
                    <Input 
                      value={manualClassification.oficio}
                      onChange={(e) => setManualClassification({...manualClassification, oficio: e.target.value})}
                      placeholder="Ej: Tejeduría"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t.codigoCUOC}</Label>
                      <Input 
                        value={manualClassification.codigoOficioCUOC}
                        onChange={(e) => setManualClassification({...manualClassification, codigoOficioCUOC: e.target.value})}
                        placeholder="Ej: A.01"
                      />
                    </div>
                    <div>
                      <Label>{t.codigoAdeC}</Label>
                      <Input 
                        value={manualClassification.codigoOficioAdeC}
                        onChange={(e) => setManualClassification({...manualClassification, codigoOficioAdeC: e.target.value})}
                        placeholder="Ej: OF-001"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>{t.materiaPrima}</Label>
                    <Input 
                      value={manualClassification.materiaPrima}
                      onChange={(e) => setManualClassification({...manualClassification, materiaPrima: e.target.value})}
                      placeholder="Ej: Lana"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t.codigoCUOC}</Label>
                      <Input 
                        value={manualClassification.codigoMateriaPrimaCUOC}
                        onChange={(e) => setManualClassification({...manualClassification, codigoMateriaPrimaCUOC: e.target.value})}
                        placeholder="Ej: M.01"
                      />
                    </div>
                    <div>
                      <Label>{t.codigoAdeC}</Label>
                      <Input 
                        value={manualClassification.codigoMateriaPrimaAdeC}
                        onChange={(e) => setManualClassification({...manualClassification, codigoMateriaPrimaAdeC: e.target.value})}
                        placeholder="Ej: MP-001"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>{t.justificacion}</Label>
                    <Textarea 
                      value={manualClassification.justificacion}
                      onChange={(e) => setManualClassification({...manualClassification, justificacion: e.target.value})}
                      placeholder="Describe por qué esta clasificación es apropiada..."
                      rows={4}
                    />
                  </div>

                  <Button 
                    onClick={handleManualClassify} 
                    className="w-full h-12 text-lg"
                    disabled={!manualClassification.oficio || !manualClassification.materiaPrima}
                  >
                    <Save className="w-5 h-5 mr-2" />
                    {t.saveChanges}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* BUSINESS INFO SECTION */}
      {!isEditing ? (
        <Card className="p-6 space-y-4">
          {/* Brand Name */}
          <Card className={`p-4 ${brandNameComplete ? 'border-green-500' : 'border-border'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Label className="text-sm font-semibold text-muted-foreground">{t.brandName}</Label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-lg font-bold">{editedData.brand_name}</p>
                  {brandNameComplete ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Badge variant="secondary">Opcional</Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Craft Type */}
          <Card className={`p-4 ${!craftTypeComplete ? 'border-2 border-amber-500' : 'border-green-500'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Label className="text-sm font-semibold text-muted-foreground">{t.craftType}</Label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-lg font-bold">{editedData.craft_type}</p>
                  {craftTypeComplete ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Badge variant="destructive">{t.required}</Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Location */}
          <Card className={`p-4 ${!locationComplete ? 'border-2 border-amber-500' : 'border-green-500'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Label className="text-sm font-semibold text-muted-foreground">{t.location}</Label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-lg font-bold">{editedData.business_location}</p>
                  {locationComplete ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Badge variant="destructive">{t.required}</Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Unique Value */}
          <Card className={`p-4 ${!uniqueValueComplete ? 'border-2 border-amber-500' : 'border-green-500'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Label className="text-sm font-semibold text-muted-foreground">{t.uniqueValue}</Label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-lg font-bold">{editedData.unique_value}</p>
                  {uniqueValueComplete ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Badge variant="destructive">{t.required}</Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </Card>
      ) : (
        <Card className="p-6 space-y-4">
          <Input value={editedData.brand_name} onChange={(e) => setEditedData({...editedData, brand_name: e.target.value})} placeholder={t.brandName} />
          <Input value={editedData.craft_type} onChange={(e) => setEditedData({...editedData, craft_type: e.target.value})} placeholder={t.craftType} />
          <LocationAutocomplete value={editedData.business_location} onChange={(value) => setEditedData({...editedData, business_location: value})} />
          <Textarea value={editedData.unique_value} onChange={(e) => setEditedData({...editedData, unique_value: e.target.value})} placeholder={t.uniqueValue} />
        </Card>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex flex-col gap-4">
        {/* Warning message if missing required fields */}
        {!canProceed && !isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-amber-50 border-2 border-amber-400 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">{t.missingFields}</p>
                <p className="text-sm text-amber-800 mt-1">{t.completeRequired}</p>
              </div>
            </div>
          </motion.div>
        )}
        
        <div className="flex justify-between">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={onEdit}>
                <Pencil className="w-4 h-4 mr-2" />
                {t.edit}
              </Button>
              <Button 
                onClick={() => onConfirm(editedData)}
                disabled={!canProceed}
              >
                {canProceed ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t.confirm}
                  </>
                ) : (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t.completeFieldsFirst}
                  </>
                )}
              </Button>
            </>
          ) : (
          <><Button variant="outline" onClick={() => {setIsEditing(false); setEditedData(extractedInfo);}}>{t.cancel}</Button>
          <Button onClick={() => {setIsEditing(false); onConfirm(editedData);}}>{t.saveChanges}</Button></>
        )}
        </div>
      </div>
    </motion.div>
  );
};
