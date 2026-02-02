/**
 * Brand Mission Generator
 * 
 * Convierte hallazgos del diagnóstico de marca en misiones concretas
 * Reglas basadas en puntuaciones por área (logo, color, tipografía, claim, identidad global)
 */

interface DiagnosisScore {
  score: number;
  reasoning: string;
}

interface BrandDiagnosis {
  scores: {
    logo: DiagnosisScore;
    color: DiagnosisScore;
    typography: DiagnosisScore;
    claim: DiagnosisScore;
    global_identity: DiagnosisScore;
  };
  average_score: number;
  summary: string;
  strengths: string[];
  opportunities: string[];
  risks: string[];
}

interface GeneratedMission {
  title: string;
  description: string;
  agent_id: string;
  priority: 'high' | 'medium' | 'low';
  relevance: 'high' | 'medium' | 'low';
  milestone_category: string;
  diagnosis_issue: string;
  estimated_time: string;
  steps: {
    title: string;
    description: string;
    deliverable: string;
  }[];
}

const MISSION_TEMPLATES = {
  // Logo issues
  low_logo_clarity: {
    title: 'Simplificar Logo para Mayor Claridad',
    description: 'Tu logo tiene elementos que dificultan su comprensión rápida. Trabaja en una versión simplificada que mantenga la esencia pero sea más clara.',
    priority: 'high' as const,
    steps: [
      {
        title: 'Identificar elementos confusos del logo actual',
        description: 'Revisa tu logo e identifica qué elementos generan confusión o son demasiado complejos',
        deliverable: 'Lista de elementos a simplificar'
      },
      {
        title: 'Crear boceto simplificado',
        description: 'Diseña una versión más limpia manteniendo los elementos esenciales',
        deliverable: 'Boceto del logo simplificado'
      },
      {
        title: 'Validar con 3-5 personas',
        description: 'Muestra ambas versiones y pregunta cuál comunica mejor tu negocio',
        deliverable: 'Feedback documentado'
      }
    ]
  },
  low_logo_scalability: {
    title: 'Optimizar Logo para Diferentes Tamaños',
    description: 'Tu logo pierde legibilidad en tamaños pequeños. Crea versiones adaptadas para redes sociales, etiquetas y banners.',
    priority: 'medium' as const,
    steps: [
      {
        title: 'Probar logo en diferentes tamaños',
        description: 'Exporta tu logo en 32x32px, 200x200px y 1000x1000px para ver cómo se ve',
        deliverable: 'Capturas en diferentes tamaños'
      },
      {
        title: 'Crear versión icono (sin texto)',
        description: 'Diseña una versión minimalista solo con el ícono para tamaños pequeños',
        deliverable: 'Logo icono optimizado'
      },
      {
        title: 'Crear versión horizontal para banners',
        description: 'Adapta el logo a formato horizontal para headers y firmas',
        deliverable: 'Logo horizontal'
      }
    ]
  },
  
  // Color issues
  low_color_harmony: {
    title: 'Revisar Armonía de Colores',
    description: 'Los colores actuales no armonizan bien entre sí. Ajusta tu paleta usando teoría del color.',
    priority: 'medium' as const,
    steps: [
      {
        title: 'Analizar paleta actual con herramienta de color',
        description: 'Usa Adobe Color o Coolors para ver la armonía de tu paleta actual',
        deliverable: 'Análisis de paleta actual'
      },
      {
        title: 'Generar paleta armónica',
        description: 'Crea una paleta complementaria o análoga basada en tus colores primarios',
        deliverable: 'Nueva paleta armónica'
      },
      {
        title: 'Aplicar nueva paleta a elementos de marca',
        description: 'Actualiza logo, redes y materiales con la paleta mejorada',
        deliverable: 'Ejemplos visuales con nueva paleta'
      }
    ]
  },
  low_color_coherence: {
    title: 'Alinear Colores con tu Tipo de Producto',
    description: 'Tus colores no reflejan el tipo de artesanía que haces. Ajusta según materiales, público y contexto cultural.',
    priority: 'high' as const,
    steps: [
      {
        title: 'Investigar paletas en tu rubro',
        description: 'Busca referencias de marcas similares y observa qué colores usan',
        deliverable: 'Moodboard de referencias'
      },
      {
        title: 'Definir emociones y valores a transmitir',
        description: 'Escribe 3-5 emociones o valores que debe transmitir tu marca',
        deliverable: 'Lista de valores y emociones'
      },
      {
        title: 'Elegir paleta coherente',
        description: 'Selecciona colores que conecten con tu artesanía y público objetivo',
        deliverable: 'Paleta final con justificación'
      }
    ]
  },
  
  // Typography issues
  no_typography_defined: {
    title: 'Definir Tipografías Oficiales de Marca',
    description: 'Tu marca no tiene tipografías definidas. Elige 1-2 familias tipográficas coherentes y consistentes.',
    priority: 'medium' as const,
    steps: [
      {
        title: 'Explorar tipografías según personalidad de marca',
        description: 'Busca fuentes que reflejen si tu marca es moderna, tradicional, divertida, elegante, etc.',
        deliverable: 'Lista de 3-5 opciones tipográficas'
      },
      {
        title: 'Seleccionar tipografía primaria y secundaria',
        description: 'Elige una para títulos y otra para cuerpo de texto (puede ser la misma familia)',
        deliverable: 'Tipografías oficiales definidas'
      },
      {
        title: 'Crear guía de uso tipográfico',
        description: 'Documenta tamaños, pesos y usos para cada tipografía',
        deliverable: 'Guía de tipografía'
      }
    ]
  },
  too_many_fonts: {
    title: 'Reducir Número de Tipografías',
    description: 'Usas demasiadas fuentes distintas, lo que genera inconsistencia. Unifica a 1-2 familias coherentes.',
    priority: 'medium' as const,
    steps: [
      {
        title: 'Auditar uso actual de tipografías',
        description: 'Identifica todas las fuentes que usas actualmente en diferentes materiales',
        deliverable: 'Inventario de tipografías usadas'
      },
      {
        title: 'Elegir 1-2 familias principales',
        description: 'Selecciona las más representativas y coherentes con tu marca',
        deliverable: 'Tipografías elegidas'
      },
      {
        title: 'Reemplazar fuentes en todos los materiales',
        description: 'Actualiza redes, documentos y materiales con las tipografías unificadas',
        deliverable: 'Materiales actualizados'
      }
    ]
  },
  
  // Claim issues
  no_claim: {
    title: 'Crear Claim que Explique tu Valor Único',
    description: 'Tu marca no tiene un claim definido. Crea una frase de 5-8 palabras que comunique qué haces y para quién.',
    priority: 'high' as const,
    steps: [
      {
        title: 'Definir tu propuesta de valor única',
        description: 'Escribe qué te hace diferente y por qué alguien debería elegirte',
        deliverable: 'Propuesta de valor escrita'
      },
      {
        title: 'Generar 5-10 opciones de claim',
        description: 'Crea múltiples versiones cortas y memorables',
        deliverable: 'Lista de opciones de claim'
      },
      {
        title: 'Validar con clientes potenciales',
        description: 'Prueba tus mejores opciones con tu público objetivo',
        deliverable: 'Claim final seleccionado'
      }
    ]
  },
  weak_claim_differential: {
    title: 'Fortalecer Diferencial en tu Claim',
    description: 'Tu claim actual es genérico y no comunica qué te hace único. Hazlo específico y memorable.',
    priority: 'medium' as const,
    steps: [
      {
        title: 'Identificar qué hace tu negocio realmente único',
        description: 'Encuentra tu diferencial real (técnica, historia, materiales, enfoque)',
        deliverable: 'Lista de diferenciadores'
      },
      {
        title: 'Reescribir claim incorporando diferencial',
        description: 'Crea versiones que mencionen explícitamente tu valor único',
        deliverable: 'Nuevas opciones de claim'
      },
      {
        title: 'A/B test en redes sociales',
        description: 'Prueba diferentes claims en stories y observa reacciones',
        deliverable: 'Claim ganador con métricas'
      }
    ]
  },
  
  // Global identity issues
  misalignment_with_audience: {
    title: 'Alinear Identidad Visual con Público Objetivo',
    description: 'Tu marca no refleja visualmente a quién te diriges. Ajusta estilo según tu cliente ideal.',
    priority: 'high' as const,
    steps: [
      {
        title: 'Crear perfil detallado de cliente ideal',
        description: 'Define edad, gustos, valores, estilo de vida de tu cliente perfecto',
        deliverable: 'Buyer persona documentado'
      },
      {
        title: 'Analizar si tu identidad conecta con ese perfil',
        description: 'Revisa logo, colores, tipografía y claim: ¿hablan a esa persona?',
        deliverable: 'Análisis de alineación'
      },
      {
        title: 'Ajustar elementos visuales desalineados',
        description: 'Modifica los elementos que no conectan con tu público objetivo',
        deliverable: 'Identidad actualizada'
      }
    ]
  },
  low_coherence: {
    title: 'Crear Coherencia entre Logo, Colores y Mensaje',
    description: 'Los elementos de tu marca cuentan historias diferentes. Unifica la narrativa visual y verbal.',
    priority: 'high' as const,
    steps: [
      {
        title: 'Definir los 3 valores clave de tu marca',
        description: 'Identifica los valores fundamentales que debe comunicar tu marca',
        deliverable: 'Valores de marca definidos'
      },
      {
        title: 'Evaluar coherencia de cada elemento',
        description: 'Revisa si logo, colores, tipografía y claim reflejan esos valores',
        deliverable: 'Mapa de coherencia'
      },
      {
        title: 'Ajustar elementos incoherentes',
        description: 'Modifica los elementos que no cuentan la misma historia',
        deliverable: 'Identidad unificada'
      }
    ]
  },
  needs_customer_testing: {
    title: 'Testear Identidad con 5 Clientes Potenciales',
    description: 'Tu marca genera confusión en el mercado. Valida con clientes reales y ajusta según feedback.',
    priority: 'high' as const,
    steps: [
      {
        title: 'Preparar test de percepción de marca',
        description: 'Define 5-7 preguntas clave sobre cómo perciben tu marca',
        deliverable: 'Cuestionario de percepción'
      },
      {
        title: 'Entrevistar a 5 clientes potenciales',
        description: 'Muestra tu identidad y recoge feedback sincero',
        deliverable: 'Entrevistas documentadas'
      },
      {
        title: 'Implementar ajustes basados en feedback',
        description: 'Identifica patrones en el feedback y ajusta tu identidad',
        deliverable: 'Plan de mejoras implementado'
      }
    ]
  }
};

export function generateBrandMissions(diagnosis: BrandDiagnosis, brandName: string): GeneratedMission[] {
  const missions: GeneratedMission[] = [];
  const { scores, average_score } = diagnosis;

  // Logo issues
  if (scores.logo.score < 3) {
    missions.push({
      ...MISSION_TEMPLATES.low_logo_clarity,
      title: `Simplificar Logo de ${brandName} para Mayor Claridad`,
      diagnosis_issue: 'low_logo_clarity',
      agent_id: 'digital-presence',
      relevance: 'high',
      milestone_category: 'milestone_brand',
      estimated_time: '2-3 horas'
    });
  } else if (scores.logo.score === 3 && scores.logo.reasoning.toLowerCase().includes('escala')) {
    missions.push({
      ...MISSION_TEMPLATES.low_logo_scalability,
      title: `Optimizar Logo de ${brandName} para Diferentes Tamaños`,
      diagnosis_issue: 'low_logo_scalability',
      agent_id: 'digital-presence',
      relevance: 'medium',
      milestone_category: 'milestone_brand',
      estimated_time: '1-2 horas'
    });
  }

  // Color issues
  if (scores.color.score < 3) {
    if (scores.color.reasoning.toLowerCase().includes('armon')) {
      missions.push({
        ...MISSION_TEMPLATES.low_color_harmony,
        title: `Revisar Armonía de Colores de ${brandName}`,
        diagnosis_issue: 'low_color_harmony',
        agent_id: 'digital-presence',
        relevance: 'medium',
        milestone_category: 'milestone_brand',
        estimated_time: '1 hora'
      });
    } else {
      missions.push({
        ...MISSION_TEMPLATES.low_color_coherence,
        title: `Alinear Colores de ${brandName} con tu Tipo de Producto`,
        diagnosis_issue: 'low_color_coherence',
        agent_id: 'digital-presence',
        relevance: 'high',
        milestone_category: 'milestone_brand',
        estimated_time: '2 horas'
      });
    }
  }

  // Typography issues
  if (scores.typography.score < 2) {
    missions.push({
      ...MISSION_TEMPLATES.no_typography_defined,
      title: `Definir Tipografías Oficiales de ${brandName}`,
      diagnosis_issue: 'no_typography_defined',
      agent_id: 'digital-presence',
      relevance: 'medium',
      milestone_category: 'milestone_brand',
      estimated_time: '1 hora'
    });
  } else if (scores.typography.score === 2 && scores.typography.reasoning.toLowerCase().includes('muchas') || scores.typography.reasoning.toLowerCase().includes('inconsist')) {
    missions.push({
      ...MISSION_TEMPLATES.too_many_fonts,
      title: `Reducir Número de Tipografías en ${brandName}`,
      diagnosis_issue: 'too_many_fonts',
      agent_id: 'digital-presence',
      relevance: 'medium',
      milestone_category: 'milestone_brand',
      estimated_time: '1 hora'
    });
  }

  // Claim issues
  if (scores.claim.score < 2) {
    missions.push({
      ...MISSION_TEMPLATES.no_claim,
      title: `Crear Claim para ${brandName} que Explique tu Valor Único`,
      diagnosis_issue: 'no_claim',
      agent_id: 'digital-presence',
      relevance: 'high',
      milestone_category: 'milestone_brand',
      estimated_time: '1-2 horas'
    });
  } else if (scores.claim.score < 4 && (scores.claim.reasoning.toLowerCase().includes('genéric') || scores.claim.reasoning.toLowerCase().includes('diferenc'))) {
    missions.push({
      ...MISSION_TEMPLATES.weak_claim_differential,
      title: `Fortalecer Diferencial en el Claim de ${brandName}`,
      diagnosis_issue: 'weak_claim_differential',
      agent_id: 'digital-presence',
      relevance: 'medium',
      milestone_category: 'milestone_brand',
      estimated_time: '1 hora'
    });
  }

  // Global identity issues
  if (scores.global_identity.score < 3) {
    if (scores.global_identity.reasoning.toLowerCase().includes('público') || scores.global_identity.reasoning.toLowerCase().includes('audiencia')) {
      missions.push({
        ...MISSION_TEMPLATES.misalignment_with_audience,
        title: `Alinear Identidad Visual de ${brandName} con Público Objetivo`,
        diagnosis_issue: 'misalignment_with_audience',
        agent_id: 'digital-presence',
        relevance: 'high',
        milestone_category: 'milestone_brand',
        estimated_time: '2-3 horas'
      });
    } else if (scores.global_identity.reasoning.toLowerCase().includes('coherenc') || scores.global_identity.reasoning.toLowerCase().includes('unific')) {
      missions.push({
        ...MISSION_TEMPLATES.low_coherence,
        title: `Crear Coherencia en la Identidad de ${brandName}`,
        diagnosis_issue: 'low_coherence',
        agent_id: 'digital-presence',
        relevance: 'high',
        milestone_category: 'milestone_brand',
        estimated_time: '2-3 horas'
      });
    }
  }

  // If overall score is low and feedback indicates confusion
  if (average_score < 3 && diagnosis.risks.length > 0) {
    const needsTesting = diagnosis.risks.some(risk => 
      risk.toLowerCase().includes('confus') || 
      risk.toLowerCase().includes('cliente') ||
      risk.toLowerCase().includes('percep')
    );
    
    if (needsTesting && missions.length < 5) {
      missions.push({
        ...MISSION_TEMPLATES.needs_customer_testing,
        title: `Testear Identidad de ${brandName} con 5 Clientes Potenciales`,
        diagnosis_issue: 'needs_customer_testing',
        agent_id: 'digital-presence',
        relevance: 'high',
        milestone_category: 'milestone_brand',
        estimated_time: '2-3 horas'
      });
    }
  }

  // Sort by priority (high first) and limit to 5 missions
  return missions
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, 5);
}
