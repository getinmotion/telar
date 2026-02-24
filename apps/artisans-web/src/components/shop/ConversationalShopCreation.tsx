import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useAuthStore } from '@/stores/authStore';
import { useUnifiedUserData } from '@/hooks/user/useUnifiedUserData';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Loader2, Store, Sparkles, ArrowRight, MessageCircle, Bot, User, Wand2, Edit2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { mapProfileDataToShopData, getMissingShopFields, hasCompleteShopData, getPrefilledDataSummary } from '@/utils/shopDataMapper';
import { motion, AnimatePresence } from 'framer-motion';
import { ColombiaLocationSelect, formatRegionFromLocation } from '@/components/ui/colombia-location-select';

interface ConversationalMessage {
  id: string;
  type: 'coordinator' | 'user';
  content: string;
  data?: any;
  timestamp: Date;
  isTyping?: boolean;
}

interface ShopCreationState {
  phase: 'conversing' | 'creating' | 'complete';
  shopData: any;
  conversation: ConversationalMessage[];
  currentQuestion: string;
  questionIndex: number;
  isCoordinatorThinking?: boolean;
}

interface ConversationalShopCreationProps {
  existingShop?: any;
}

export const ConversationalShopCreation: React.FC<ConversationalShopCreationProps> = ({ existingShop }) => {
  const [state, setState] = useState<ShopCreationState>({
    phase: 'conversing',
    shopData: {},
    conversation: [],
    currentQuestion: 'shop_name',
    questionIndex: 0,
    isCoordinatorThinking: false,
  });

  const [prefilledData, setPrefilledData] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isEditingPrefilled, setIsEditingPrefilled] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Structured location state
  const [locationData, setLocationData] = useState({ department: '', municipality: '' });

  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const authStore = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { createShop, updateShopProgress } = useArtisanShop();
  const { profile, context, updateContext, loading: unifiedLoading } = useUnifiedUserData();

  // Define the 3 essential questions (before useEffect)
  const questions = [
    {
      key: 'shop_name',
      text: '¿Cuál es el nombre de tu tienda?',
      suggestions: ['Artesanías Luna', 'Taller Creativo', 'Mi Marca Artesanal'],
      examples: '💡 Ejemplo: "Tejidos Colombia", "Cerámica Bella", "Cueros del Valle"'
    },
    {
      key: 'products',
      text: '¿Qué productos específicos vendes?',
      suggestions: ['Collares y aretes', 'Bolsos de cuero', 'Cerámicas decorativas', 'Textiles tejidos'],
      examples: '💡 Sé específico: "collares de semillas", "bolsos de cuero", "macetas de barro"'
    },
    {
      key: 'location',
      text: '¿En qué ciudad estás ubicado?',
      suggestions: ['Bogotá', 'Medellín', 'Cartagena', 'Cali'],
      examples: '💡 Esto nos ayuda a configurar los envíos correctamente'
    }
  ];

  // Auto-redirect to shop when complete
  useEffect(() => {
    if (state.phase === 'complete') {
      const timer = setTimeout(() => {
        navigate('/mi-tienda');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.phase, navigate]);

  // Load existing context and pre-populate data
  useEffect(() => {
    const loadExistingContext = async () => {
      if (!user?.id) {
        setIsInitializing(true);
        return;
      }

      // If continuing existing shop, use that data
      if (existingShop) {
        const shopData = {
          shop_name: existingShop.shop_name || '',
          description: existingShop.description || '',
          craft_type: existingShop.craft_type || '',
          region: existingShop.region || '',
        };

        setState({
          phase: 'conversing',
          shopData,
          conversation: [{
            id: 'initial',
            type: 'coordinator',
            content: `¡Hola de nuevo! Veo que ya habías empezado a crear tu tienda "${existingShop.shop_name || 'sin nombre'}". Continuemos desde donde nos quedamos.`,
            timestamp: new Date()
          }],
          currentQuestion: 'shop_name',
          questionIndex: existingShop.creation_step || 0,
          isCoordinatorThinking: false,
        });
        setIsInitializing(false);
        return;
      }

      try {
        // 🚀 OPCIÓN 2: Usar datos del authStore PRIMERO (caché inmediato)
        let profileData = null;

        // 1. Intentar obtener datos del authStore (disponible inmediatamente)
        const cachedContext = authStore.userMasterContext;
        if (cachedContext?.business_profile) {
          const bp = cachedContext.business_profile;
          profileData = {
            brandName: bp.brand_name || bp.brandName,
            businessDescription: bp.business_description || bp.businessDescription,
            craftType: bp.craft_type || bp.craftType || bp.business_type,
            businessLocation: bp.business_location || bp.businessLocation || bp.ubicacion,
          };


        }

        // 2. Si no hay datos en cache y unifiedLoading aún está cargando, esperar
        if (!profileData && unifiedLoading) {
          setIsInitializing(true);
          return;
        }

        // 3. Usar datos frescos de unified data si están disponibles (después del fetch)
        if (!profileData && (profile?.brandName || profile?.businessDescription)) {
          profileData = {
            brandName: profile.brandName,
            businessDescription: profile.businessDescription,
            craftType: profile.businessType,
            businessLocation: profile.businessLocation || profile.city,
            email: profile.email,
            whatsapp_e164: profile.whatsappE164,
          };
        }

        // 4. Fallback to context.businessProfile if profile doesn't have data
        if (!profileData && context?.businessProfile) {
          const bp = context.businessProfile;
          profileData = {
            brandName: bp.brand_name || bp.brandName,
            businessDescription: bp.business_description || bp.businessDescription,
            craftType: bp.craft_type || bp.craftType || bp.business_type,
            businessLocation: bp.business_location || bp.businessLocation || bp.ubicacion,
          };
        }

        // 3. Map profile data to shop data
        if (profileData) {
          let mappedShopData = mapProfileDataToShopData(profileData);

          // 🔥 NUEVO: Refinar descripción con IA si existe
          if (mappedShopData.description && mappedShopData.description.length > 10) {
            try {
              const { data: refinedData, error: refineError } = await supabase.functions.invoke('create-intelligent-shop', {
                body: {
                  userId: user?.id,
                  action: 'process_conversation',
                  userResponse: mappedShopData.description,
                  currentQuestion: 'products',
                  conversationHistory: [],
                  shopData: mappedShopData,
                  language: 'es'
                }
              });

              if (!refineError && refinedData?.updatedShopData?.description) {
                mappedShopData = {
                  ...mappedShopData,
                  description: refinedData.updatedShopData.description,
                  craft_type: refinedData.updatedShopData.craft_type || mappedShopData.craft_type
                };
              }
            } catch (refineErr) {
              console.warn('⚠️ [CONVERSATIONAL-SHOP] Could not refine description:', refineErr);
              // Continúa con la descripción original
            }
          }

          const missingFields = getMissingShopFields(mappedShopData);
          const isComplete = hasCompleteShopData(mappedShopData);


          setPrefilledData(mappedShopData);

          if (isComplete) {
            // All data available - show confirmation
            setShowConfirmation(true);
            setState({
              phase: 'conversing',
              shopData: mappedShopData,
              conversation: [{
                id: 'initial',
                type: 'coordinator',
                content: '¡Perfecto! Ya tengo toda tu información del assessment. Aquí está lo que detecté:',
                timestamp: new Date()
              }],
              currentQuestion: 'complete',
              questionIndex: questions.length,
              isCoordinatorThinking: false,
            });
            setIsInitializing(false);
          } else if (missingFields.length < questions.length) {
            // Partial data - skip some questions
            const prefilledSummary = getPrefilledDataSummary(mappedShopData);
            const firstMissingIndex = questions.findIndex(q => missingFields.includes(q.key));
            const firstMissingQuestion = questions[firstMissingIndex];

            setState({
              phase: 'conversing',
              shopData: mappedShopData,
              conversation: [{
                id: 'initial',
                type: 'coordinator',
                content: `¡Hola! 🎯 Vi que ya completaste tu assessment y tengo tu ${prefilledSummary}. Solo necesito confirmar algunos datos más.\n\n${firstMissingQuestion.text}\n\n${firstMissingQuestion.examples}`,
                timestamp: new Date()
              }],
              currentQuestion: firstMissingQuestion.key,
              questionIndex: firstMissingIndex,
              isCoordinatorThinking: false,
            });

            setQuickReplies(firstMissingQuestion.suggestions);
            setShowSuggestions(true);
            setIsInitializing(false);
          } else {
            // No useful data - start from scratch
            initializeDefaultState();
          }
        } else {
          // No profile data - start from scratch
          initializeDefaultState();
        }
      } catch (error) {
        console.error('Error loading context:', error);
        initializeDefaultState();
      }
    };

    const initializeDefaultState = () => {
      setState({
        phase: 'conversing',
        shopData: {},
        conversation: [{
          id: 'initial',
          type: 'coordinator',
          content: '¡Hola! 🎯 Soy tu Coordinador Maestro. Voy a crear tu tienda digital en 3 simples pasos. ¿Cuál es el nombre de tu tienda?',
          timestamp: new Date()
        }],
        currentQuestion: 'shop_name',
        questionIndex: 0,
        isCoordinatorThinking: false,
      });
      setQuickReplies(questions[0].suggestions);
      setShowSuggestions(true);
      setIsInitializing(false);
    };

    loadExistingContext();
  }, [user?.id, profile, context, unifiedLoading, existingShop, authStore.userMasterContext]);

  const createShopAutomatically = async (shopData: any) => {
    setState(prev => ({
      ...prev,
      phase: 'creating',
      conversation: [...prev.conversation, {
        id: Date.now().toString(),
        type: 'coordinator',
        content: '✨ Perfecto! Tengo toda la información necesaria. Estoy creando tu tienda digital ahora...',
        timestamp: new Date()
      }]
    }));

    try {
      let result;
      if (existingShop) {
        // Update existing shop
        result = await updateShopProgress(existingShop.id, {
          shop_name: shopData.shop_name,
          description: shopData.description,
          story: shopData.story,
          craft_type: shopData.craft_type,
          region: shopData.region,
          contact_info: shopData.contact_info,
          social_links: shopData.social_links,
        }, 'complete', 0);
      } else {
        // Create new shop
        result = await createShop({
          shop_name: shopData.shop_name,
          description: shopData.description,
          story: shopData.story,
          craft_type: shopData.craft_type,
          region: shopData.region,
          contact_info: shopData.contact_info,
          social_links: shopData.social_links,
        });
      }

      if (result) {
        // 🔥 NUEVO: Actualizar master context con info de tienda usando unified data
        const existingContext = context?.conversationInsights || {};
        await updateContext({
          conversationInsights: {
            ...existingContext,
            has_shop: true,
            shop_id: result.id,
            shop_name: shopData.shop_name,
            shop_created_at: new Date().toISOString()
          }
        });

        // 🔥 NUEVO: Publicar evento para MasterAgentContext
        const { EventBus } = await import('@/utils/eventBus');
        EventBus.publish('shop.created', {
          shopId: result.id,
          shopName: shopData.shop_name,
          userId: user!.id
        });

        setState(prev => ({
          ...prev,
          phase: 'complete',
          conversation: [...prev.conversation, {
            id: Date.now().toString(),
            type: 'coordinator',
            content: '🎉 ¡Listo! Tu tienda digital ha sido creada exitosamente. Ahora puedes ir al dashboard para gestionarla o empezar a cargar productos.',
            timestamp: new Date()
          }]
        }));

        toast({
          title: "¡Tienda creada!",
          description: "Tu tienda digital está lista.",
        });
      }
    } catch (error) {
      console.error('Error creating shop:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear tu tienda. Intentémoslo de nuevo.",
        variant: "destructive"
      });
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.conversation]);

  // Fast typing animation for quick flow
  const simulateTyping = async (text: string, callback: () => void) => {
    setState(prev => ({ ...prev, isCoordinatorThinking: true }));
    setTypingText('');

    // Fast typing - 10ms per character maximum
    for (let i = 0; i <= text.length; i++) {
      setTypingText(text.slice(0, i));
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    setState(prev => ({ ...prev, isCoordinatorThinking: false }));
    setTypingText('');
    callback();
  };

  // Get current question suggestions
  const getCurrentSuggestions = () => {
    return questions[state.questionIndex]?.suggestions || [];
  };

  const handleUserResponse = async (response: string) => {
    if (!response.trim()) return;

    setIsProcessing(true);

    // Add user message to conversation
    const userMessage: ConversationalMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: response,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      conversation: [...prev.conversation, userMessage]
    }));

    // Update shop data based on current question
    let updatedShopData = { ...state.shopData };
    const currentQ = questions[state.questionIndex];

    if (currentQ.key === 'shop_name') {
      const trimmedName = response.trim();

      // Validar que no sea un nombre genérico
      const genericNames = [
        'Tu Negocio', 'Tu Emprendimiento', 'Tu Empresa', 'Tu Proyecto',
        'Tu Startup', 'Tu Taller Artesanal', 'Tu Sello Musical',
        'Tu Productora Musical', 'Tu Estudio Creativo', 'Tu Consultoría', 'Tu Agencia'
      ];

      if (genericNames.some(generic => trimmedName.toLowerCase() === generic.toLowerCase())) {
        setState(prev => ({
          ...prev,
          conversation: [
            ...prev.conversation,
            {
              id: Date.now().toString(),
              type: 'coordinator' as const,
              content: '❌ Por favor, ingresa el nombre REAL de tu negocio o marca, no un nombre genérico. Por ejemplo: "Artesanías Doña María", "Café de la Montaña", etc.',
              timestamp: new Date()
            }
          ]
        }));
        setIsProcessing(false);
        return;
      }
    }

    try {
      // 🔥 NUEVO: Llamar al edge function para refinar el texto con IA
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('create-intelligent-shop', {
        body: {
          userId: user!.id,
          action: 'process_conversation',
          userResponse: response,
          currentQuestion: currentQ.key,
          conversationHistory: state.conversation,
          shopData: state.shopData,
          language: 'es'
        }
      });

      if (edgeError) {
        console.warn('⚠️ Edge function error, usando texto original:', edgeError);
        // Fallback: usar texto original sin refinar
        if (currentQ.key === 'shop_name') {
          updatedShopData.shop_name = response.trim();
        } else if (currentQ.key === 'products') {
          updatedShopData.description = response.trim();
          updatedShopData.craft_type = detectCraftTypeFromText(response);
        } else if (currentQ.key === 'location') {
          updatedShopData.region = response.trim();
        }
      } else {
        // ✅ Usar datos refinados por IA
        updatedShopData = edgeData.updatedShopData || updatedShopData;
      }
    } catch (error) {
      console.error('Error refinando con IA:', error);
      // Fallback: usar texto original
      if (currentQ.key === 'shop_name') {
        updatedShopData.shop_name = response.trim();
      } else if (currentQ.key === 'products') {
        updatedShopData.description = response.trim();
        updatedShopData.craft_type = detectCraftTypeFromText(response);
      } else if (currentQ.key === 'location') {
        updatedShopData.region = response.trim();
      }
    }

    // Check if we have more questions
    const nextIndex = state.questionIndex + 1;

    if (nextIndex < questions.length) {
      // Move to next question
      const nextQuestion = questions[nextIndex];

      await simulateTyping(`✅ Perfecto! ${nextQuestion.text}`, () => {
        const coordinatorMessage: ConversationalMessage = {
          id: (Date.now() + 1).toString(),
          type: 'coordinator',
          content: `✅ Perfecto! ${nextQuestion.text}\n\n${nextQuestion.examples}`,
          timestamp: new Date()
        };

        setState(prev => ({
          ...prev,
          conversation: [...prev.conversation, coordinatorMessage],
          shopData: updatedShopData,
          currentQuestion: nextQuestion.key,
          questionIndex: nextIndex
        }));

        setQuickReplies(nextQuestion.suggestions);
        setShowSuggestions(true);
      });
    } else {
      // All questions answered - create shop
      const finalShopData = {
        ...updatedShopData,
        story: `Somos ${updatedShopData.shop_name}, especialistas en ${updatedShopData.description} desde ${updatedShopData.region}. Cada producto está hecho con amor y tradición artesanal colombiana.`,
        contact_info: { email: user?.email },
        social_links: {}
      };

      await simulateTyping('🎉 ¡Excelente! Ya tengo toda la información. Creando tu tienda digital...', () => {
        const coordinatorMessage: ConversationalMessage = {
          id: (Date.now() + 1).toString(),
          type: 'coordinator',
          content: '🎉 ¡Excelente! Ya tengo toda la información. Creando tu tienda digital...',
          timestamp: new Date()
        };

        setState(prev => ({
          ...prev,
          conversation: [...prev.conversation, coordinatorMessage],
          shopData: finalShopData
        }));

        setTimeout(() => createShopAutomatically(finalShopData), 1000);
      });
    }

    setIsProcessing(false);
    setUserInput('');
  };

  // Simple craft type detection
  const detectCraftTypeFromText = (text: string): string => {
    const craftTypes: Record<string, string[]> = {
      'textiles': ['tejido', 'tela', 'lana', 'algodón', 'bordado', 'tapiz'],
      'ceramica': ['cerámica', 'barro', 'arcilla', 'maceta', 'vasija'],
      'joyeria': ['collar', 'arete', 'pulsera', 'anillo', 'joya', 'plata'],
      'cuero': ['cuero', 'bolso', 'cartera', 'cinturón', 'marroquinería'],
      'madera': ['madera', 'tallado', 'mueble', 'decorativo']
    };

    const lowerText = text.toLowerCase();
    for (const [type, keywords] of Object.entries(craftTypes)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return type;
      }
    }
    return 'artesanias';
  };


  // Render confirmation view for pre-filled data
  const renderConfirmationView = () => (
    <div className="space-y-6">
      <Card className="border-2 border-accent/20 dark:border-accent/30">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            ¡Perfecto! Ya tengo toda tu información
          </CardTitle>
          <CardDescription>
            Detecté estos datos de tu assessment. ¿Quieres crear tu tienda con esta información?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-left">
          <div className="space-y-3 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg text-left">
            <div className="flex items-start gap-3">
              <Store className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 text-left">
                <p className="text-md font-bold text-foreground text-left ">Nombre de tienda</p>
                {isEditingPrefilled ? (
                  <Input
                    value={state.shopData.shop_name || ''}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      shopData: { ...prev.shopData, shop_name: e.target.value }
                    }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-base text-foreground font-medium text-left italic">{state.shopData.shop_name}</p>
                )}
              </div>
            </div>


            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 text-left">
                <p className="text-md font-bold text-foreground text-left">Productos</p>
                {isEditingPrefilled ? (
                  <Textarea
                    value={state.shopData.description || ''}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      shopData: { ...prev.shopData, description: e.target.value }
                    }))}
                    className="mt-1"
                    rows={2}
                  />
                ) : (
                  <p className="text-base text-foreground text-left italic">{state.shopData.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ArrowRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 text-left">
                <p className="text-md font-bold  text-foreground text-left">Ubicación</p>
                {isEditingPrefilled ? (
                  <div className="mt-2">
                    <ColombiaLocationSelect
                      department={locationData.department}
                      municipality={locationData.municipality}
                      onDepartmentChange={(dept) => {
                        setLocationData(prev => ({ ...prev, department: dept, municipality: '' }));
                        setState(prev => ({
                          ...prev,
                          shopData: { ...prev.shopData, region: dept, department: dept, municipality: '' }
                        }));
                      }}
                      onMunicipalityChange={(muni) => {
                        setLocationData(prev => ({ ...prev, municipality: muni }));
                        const formattedRegion = formatRegionFromLocation(locationData.department, muni);
                        setState(prev => ({
                          ...prev,
                          shopData: { ...prev.shopData, region: formattedRegion, municipality: muni }
                        }));
                      }}
                      showLabels={false}
                      compact
                    />
                  </div>
                ) : (
                  <p className="text-base text-foreground text-left italic">{state.shopData.region || 'No especificado'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {isEditingPrefilled ? (
              <>
                <Button
                  onClick={() => {
                    setIsEditingPrefilled(false);
                    if (hasCompleteShopData(state.shopData)) {
                      // Data is still complete, can proceed
                    }
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
                <Button
                  onClick={() => {
                    setState(prev => ({ ...prev, shopData: prefilledData }));
                    setIsEditingPrefilled(false);
                  }}
                  variant="ghost"
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => {
                    const finalShopData = {
                      ...state.shopData,
                      story: `Somos ${state.shopData.shop_name}, especialistas en ${state.shopData.description} desde ${state.shopData.region}. Cada producto está hecho con amor y tradición artesanal.`,
                      contact_info: { email: user?.email },
                      social_links: {}
                    };
                    createShopAutomatically(finalShopData);
                  }}
                  className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90"
                >
                  <Store className="w-4 h-4 mr-2" />
                  Crear mi Tienda Ahora
                </Button>
                <Button
                  onClick={() => setIsEditingPrefilled(true)}
                  variant="outline"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderConversationPhase = () => {
    // Show confirmation view if all data is pre-filled
    if (showConfirmation && hasCompleteShopData(state.shopData)) {
      return renderConfirmationView();
    }

    return (
      <div className="space-y-6">
        {/* Conversation Display */}
        <div className="space-y-4 max-h-96 overflow-y-auto px-2" style={{ scrollBehavior: 'smooth' }}>
          <AnimatePresence mode="popLayout">
            {state.conversation.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <motion.div
                  className={`max-w-[85%] rounded-2xl ${message.type === 'coordinator'
                    ? 'bg-gradient-subtle dark:bg-gradient-subtle border border-border/50'
                    : 'bg-gradient-primary text-white shadow-lg ml-auto'
                    }`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {message.type === 'coordinator' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0"
                        >
                          <Bot className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                      {message.type === 'user' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 order-2"
                        >
                          <User className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                      <div className={message.type === 'user' ? 'order-1' : ''}>
                        <p className={`font-semibold text-sm mb-1 ${message.type === 'coordinator'
                          ? 'text-primary'
                          : 'text-primary-foreground'
                          }`}>
                          {message.type === 'coordinator' ? '🎯 Coordinador Maestro' : '👤 Tú'}
                        </p>
                        <motion.p
                          className={`leading-relaxed ${message.type === 'coordinator'
                            ? 'text-foreground'
                            : 'text-primary-foreground'
                            }`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          {message.content}
                        </motion.p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Coordinator thinking indicator */}
          <AnimatePresence>
            {state.isCoordinatorThinking && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-start"
              >
                <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-2xl p-4 max-w-[85%]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-primary mb-1">
                        🎯 Coordinador Maestro
                      </p>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span>{typingText}</span>
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="w-2 h-4 bg-primary inline-block"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={conversationEndRef} />
        </div>

        {/* Quick Reply Suggestions */}
        <AnimatePresence>
          {showSuggestions && quickReplies.length > 0 && !state.isCoordinatorThinking && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="flex flex-wrap gap-2 mb-4"
            >
              <p className="text-sm text-muted-foreground mb-2 w-full">✨ Sugerencias rápidas:</p>
              {quickReplies.map((suggestion, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    setUserInput(suggestion);
                    setShowSuggestions(false);
                  }}
                  className="px-3 py-2 bg-gradient-subtle rounded-full text-sm border border-border/50 hover:shadow-md transition-all duration-200"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Input */}
        <motion.div
          className="bg-gradient-card dark:bg-card rounded-2xl p-4 border shadow-sm relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-gradient-primary rounded-full opacity-30"
                animate={{
                  x: [0, 100, 0],
                  y: [0, -50, 0],
                  scale: [1, 0.5, 1],
                }}
                transition={{
                  duration: 5 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 1.5,
                }}
                style={{
                  left: `${20 + i * 30}%`,
                  top: `${50}%`,
                }}
              />
            ))}
          </div>

          <div className="flex gap-3 relative z-10">
            <div className="flex-1 relative">
              <Textarea
                value={userInput}
                onChange={(e) => {
                  setUserInput(e.target.value);
                  if (showSuggestions && e.target.value.length > 0) {
                    setShowSuggestions(false);
                  }
                }}
                placeholder="💬 Escribe tu respuesta aquí... (Enter para enviar)"
                className="border-0 resize-none bg-transparent focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                rows={2}
                disabled={isProcessing || state.isCoordinatorThinking}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleUserResponse(userInput);
                  }
                }}
                onFocus={() => setShowSuggestions(true)}
              />
              {userInput.trim() && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute bottom-2 right-2 text-xs text-muted-foreground"
                >
                  Enter ↵
                </motion.div>
              )}
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => handleUserResponse(userInput)}
                disabled={!userInput.trim() || isProcessing || state.isCoordinatorThinking}
                size="lg"
                className="bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-lg h-auto px-6 py-3"
              >
                {isProcessing || state.isCoordinatorThinking ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ x: 2 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                )}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderCreatingPhase = () => (
    <div className="text-center py-12 relative">
      {/* Advanced animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full opacity-40"
            style={{
              background: `linear-gradient(45deg, 
                hsl(${240 + i * 10}, 70%, 60%), 
                hsl(${300 + i * 15}, 80%, 70%))`,
              left: `${10 + (i % 4) * 25}%`,
              top: `${20 + Math.floor(i / 4) * 25}%`,
            }}
            animate={{
              scale: [1, 1.5, 0.5, 1],
              opacity: [0.4, 0.8, 0.2, 0.4],
              rotate: [0, 180, 360],
              x: [0, 30, -30, 0],
              y: [0, -30, 30, 0],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* Main creation animation */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.3, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 3, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
        className="mx-auto w-28 h-28 mb-8 relative"
      >
        <div className="absolute inset-0 bg-gradient-primary rounded-full opacity-20 animate-pulse" />
        <div className="absolute inset-2 bg-gradient-accent rounded-full opacity-30 animate-ping" />
        <Store className="w-28 h-28 text-transparent bg-gradient-primary bg-clip-text relative z-10" style={{
          filter: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.5))'
        }} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-3xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
          ✨ Creando tu tienda digital con IA
        </h3>
        <div className="space-y-3 max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="flex items-center gap-3 text-left"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full"
            />
            <span className="text-muted-foreground">Analizando tu información con IA...</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2 }}
            className="flex items-center gap-3 text-left"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
            />
            <span className="text-muted-foreground">Generando descripción optimizada...</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 3 }}
            className="flex items-center gap-3 text-left"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full"
            />
            <span className="text-muted-foreground">Configurando tu perfil artesanal...</span>
          </motion.div>
        </div>
        <motion.p
          className="text-lg text-muted-foreground mt-6"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          El Coordinador Maestro está trabajando su magia... 🪄
        </motion.p>
      </motion.div>
    </div>
  );


  const renderCompletePhase = () => (
    <div className="text-center py-12">
      <Store className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
      <h3 className="text-xl font-semibold mb-2">¡Tienda creada exitosamente!</h3>
      <p className="text-muted-foreground mb-6">
        ¡Tu tienda está lista! Vamos a verla ahora mismo.
      </p>
      <div className="flex gap-4 justify-center">
        <Button
          onClick={() => navigate('/mi-tienda')}
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Store className="w-4 h-4 mr-2" />
          Ir a Mi Tienda
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate('/productos/subir')}
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          Subir productos
        </Button>
      </div>
    </div>
  );

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/home')}
          className="mb-4"
        >
          ← Volver al Taller Digital
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Creación Inteligente de Tienda</h1>
          <p className="text-muted-foreground">
            El Coordinador Maestro te guiará para crear tu tienda digital perfecta
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">Preparando tu experiencia...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Estoy revisando tu información del assessment para autocompletar algunos datos
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/dashboard/home')}
        className="mb-4"
      >
        ← Volver al Taller Digital
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Creación Inteligente de Tienda</h1>
        <p className="text-muted-foreground">
          El Coordinador Maestro te guiará para crear tu tienda digital perfecta
        </p>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Store className="w-5 h-5" />
            {state.phase === 'conversing' && 'Conversación Rápida'}
            {state.phase === 'creating' && 'Creando tu Tienda'}
            {state.phase === 'complete' && '¡Tienda Creada!'}
          </CardTitle>
          <CardDescription>
            {state.phase === 'conversing' && '3 preguntas simples para crear tu tienda'}
            {state.phase === 'creating' && 'Configurando automáticamente tu tienda digital'}
            {state.phase === 'complete' && 'Tu tienda está lista. Sigamos con los productos.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {state.phase === 'conversing' && renderConversationPhase()}
          {state.phase === 'creating' && renderCreatingPhase()}
          {state.phase === 'complete' && renderCompletePhase()}
        </CardContent>
      </Card>
    </div>
  );
};