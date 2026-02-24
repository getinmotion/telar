import { ConversationBlock } from '../types/conversationalTypes';
import { UserProfileData } from '../../types/wizardTypes';

export const generateAdaptiveAgentMessage = (
  blockId: string,
  profileData: UserProfileData,
  language: 'en' | 'es'
): string => {
  const businessDesc = profileData.businessDescription || '';
  const industry = profileData.industry || '';
  const businessName = businessDesc.split(' ').slice(0, 3).join(' ');
  
  // Extract specific creative type for personalized messages
  const isKeramist = businessDesc.toLowerCase().includes('ceramic') || businessDesc.toLowerCase().includes('clay');
  const isPhotographer = businessDesc.toLowerCase().includes('photo') || businessDesc.toLowerCase().includes('imagen');
  const isDesigner = businessDesc.toLowerCase().includes('design') || businessDesc.toLowerCase().includes('diseño');
  const isMusician = businessDesc.toLowerCase().includes('music') || businessDesc.toLowerCase().includes('música');
  
  const messages = {
    en: {
      welcome: "Hi! I'm your growth agent, and I specialize in helping creative entrepreneurs like you turn passion into profit. I'll adapt my questions based on your specific creative work. Ready to begin?",
      
      businessType: isKeramist 
        ? `I can see you work with ceramics! That's fascinating - ceramics requires such specific skills and techniques. Let me understand more about your creative process and how you want to grow this beautiful craft.`
        : isPhotographer 
        ? `Photography! I love working with visual storytellers like you. Each photographer has such a unique style and target market. Let me learn more about your specific photography focus.`
        : isDesigner
        ? `Design work - excellent! Whether it's graphic, web, or product design, the creative industry has so many opportunities. Let me understand your design specialty better.`
        : isMusician
        ? `Music! Working with musicians is always inspiring. The music industry has unique challenges and opportunities. Tell me more about your musical journey.`
        : `Perfect! I can see the passion in your creative work. Every creative field has its own unique challenges and opportunities. Let me understand your specific situation better.`,
        
      currentSituation: profileData.industry 
        ? `Based on your work in ${industry}, I want to ask some targeted questions. Different creative fields have different business models and growth strategies.`
        : "Now let me understand where you are in your creative journey. This helps me give you the most relevant advice.",
        
      salesReality: profileData.businessDescription
        ? `Let's talk about the business side of ${businessName}. I know this can be challenging for creatives, but it's essential for sustainable growth.`
        : "Now for the important part - let's discuss money and sales. This isn't about judgment, it's about creating sustainable income from your passion.",
        
      currentChallenges: profileData.hasSold 
        ? "Since you've already made sales, let's identify what's preventing you from growing further. Scaling a creative business has unique challenges."
        : "Since you haven't sold yet, let's identify what's holding you back from that first sale. Every creative faces these initial hurdles.",
        
      vision: profileData.mainObstacles?.includes('scaling')
        ? "I see you're thinking about scaling. Let's talk about your long-term vision and what success really means to you."
        : "Finally, let's talk about your dreams and vision. Understanding what you really want helps me create the right growth plan for you."
    },
    
    es: {
      welcome: "¡Hola! Soy tu agente de crecimiento, y me especializo en ayudar a emprendedores creativos como tú a convertir la pasión en ganancias. Adaptaré mis preguntas según tu trabajo creativo específico. ¿Listo para comenzar?",
      
      businessType: isKeramist 
        ? `¡Veo que trabajas con cerámica! Qué fascinante - la cerámica requiere habilidades y técnicas muy específicas. Déjame entender más sobre tu proceso creativo y cómo quieres hacer crecer este hermoso oficio.`
        : isPhotographer 
        ? `¡Fotografía! Me encanta trabajar con narradores visuales como tú. Cada fotógrafo tiene un estilo y mercado objetivo tan únicos. Déjame conocer más sobre tu enfoque fotográfico específico.`
        : isDesigner
        ? `¡Trabajo de diseño - excelente! Ya sea gráfico, web o de productos, la industria creativa tiene tantas oportunidades. Déjame entender mejor tu especialidad en diseño.`
        : isMusician
        ? `¡Música! Trabajar con músicos siempre es inspirador. La industria musical tiene desafíos y oportunidades únicos. Cuéntame más sobre tu viaje musical.`
        : `¡Perfecto! Puedo ver la pasión en tu trabajo creativo. Cada campo creativo tiene sus propios desafíos y oportunidades únicos. Déjame entender mejor tu situación específica.`,
        
      currentSituation: profileData.industry 
        ? `Basándome en tu trabajo en ${industry}, quiero hacerte algunas preguntas específicas. Diferentes campos creativos tienen diferentes modelos de negocio y estrategias de crecimiento.`
        : "Ahora déjame entender dónde estás en tu viaje creativo. Esto me ayuda a darte el consejo más relevante.",
        
      salesReality: profileData.businessDescription
        ? `Hablemos del lado comercial de ${businessName}. Sé que esto puede ser desafiante para los creativos, pero es esencial para un crecimiento sostenible.`
        : "Ahora la parte importante - hablemos de dinero y ventas. Esto no es sobre juzgar, es sobre crear ingresos sostenibles de tu pasión.",
        
      currentChallenges: profileData.hasSold 
        ? "Como ya has hecho ventas, identifiquemos qué te impide crecer más. Escalar un negocio creativo tiene desafíos únicos."
        : "Como aún no has vendido, identifiquemos qué te está frenando de esa primera venta. Todo creativo enfrenta estos obstáculos iniciales.",
        
      vision: profileData.mainObstacles?.includes('scaling')
        ? "Veo que estás pensando en escalar. Hablemos de tu visión a largo plazo y lo que realmente significa el éxito para ti."
        : "Finalmente, hablemos de tus sueños y visión. Entender lo que realmente quieres me ayuda a crear el plan de crecimiento correcto para ti."
    }
  };
  
  return messages[language][blockId] || messages[language].welcome;
};

export const generateContextualQuestions = (
  blockId: string,
  profileData: UserProfileData,
  language: 'en' | 'es'
): any[] => {
  // Return additional contextual questions based on previous answers
  const additionalQuestions = [];
  
  if (blockId === 'currentSituation' && profileData.businessDescription) {
    const businessType = detectCreativeType(profileData.businessDescription);
    
    if (businessType === 'ceramist') {
      additionalQuestions.push({
        id: 'ceramic_venue',
        question: language === 'es' 
          ? '¿Tienes un estudio propio o trabajas desde casa?'
          : 'Do you have your own studio or work from home?',
        type: 'single-choice',
        fieldName: 'workVenue',
        options: [
          { id: 'home_studio', label: language === 'es' ? 'Estudio en casa' : 'Home studio', value: 'home_studio' },
          { id: 'shared_studio', label: language === 'es' ? 'Estudio compartido' : 'Shared studio', value: 'shared_studio' },
          { id: 'own_studio', label: language === 'es' ? 'Estudio propio' : 'Own studio', value: 'own_studio' },
          { id: 'no_fixed_space', label: language === 'es' ? 'Sin espacio fijo' : 'No fixed space', value: 'no_fixed_space' }
        ],
        required: true
      });
    }
  }
  
  return additionalQuestions;
};

const detectCreativeType = (businessDescription: string): string => {
  const desc = businessDescription.toLowerCase();
  if (desc.includes('ceramic') || desc.includes('clay') || desc.includes('pottery')) return 'ceramist';
  if (desc.includes('photo') || desc.includes('imagen')) return 'photographer';
  if (desc.includes('design') || desc.includes('diseño')) return 'designer';
  if (desc.includes('music') || desc.includes('sound')) return 'musician';
  if (desc.includes('paint') || desc.includes('draw')) return 'visual_artist';
  return 'creative_general';
};