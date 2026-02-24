// Milestone wizard definitions - Specific steps for each milestone

export interface WizardStep {
  title: string;
  description?: string;
  inputType: 'text' | 'textarea' | 'number' | 'file' | 'multi-file' | 'radio' | 'checkbox' | 'select' | 'color-picker';
  placeholder?: string;
  helpText?: string;
  options?: string[];
  accept?: string;
  maxFiles?: number;
  maxColors?: number;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  validation: Array<{
    type: string;
    value?: any;
    message?: string;
  }>;
  required: boolean;
  conditionalOn?: {
    stepIndex: number;
    value: string;
  };
}

export const MILESTONE_WIZARDS: Record<string, Record<string, WizardStep[]>> = {
  'formalization': {
    'complete-nit': [
      {
        title: 'Ingresa tu NIT',
        description: 'El NIT es tu Número de Identificación Tributaria en Colombia',
        inputType: 'text',
        placeholder: '123456789-0',
        helpText: 'Formato: 123456789-0',
        validation: [
          { type: 'required', message: 'El NIT es obligatorio' },
          { type: 'nit-format', message: 'Formato NIT inválido (ej: 123456789-0)' }
        ],
        required: true
      },
      {
        title: '¿Tu NIT está registrado en la DIAN?',
        description: 'Necesitamos saber el estado de tu formalización',
        inputType: 'radio',
        options: ['Sí, está registrado', 'No, aún no', 'En trámite'],
        validation: [{ type: 'required' }],
        required: true
      },
      {
        title: 'Sube foto de tu cédula o certificado (opcional)',
        description: 'Esto nos ayudará a verificar tu información',
        inputType: 'file',
        accept: 'image/*,application/pdf',
        validation: [
          { type: 'file-size', value: 5, message: 'El archivo debe ser menor a 5MB' }
        ],
        required: false
      }
    ],
    'business-profile': [
      {
        title: 'Nombre de tu negocio artesanal',
        description: '¿Cómo se llama tu emprendimiento?',
        inputType: 'text',
        placeholder: 'Ej: Tejidos María, Cerámica del Valle',
        validation: [
          { type: 'required' },
          { type: 'min-length', value: 3, message: 'Debe tener al menos 3 caracteres' }
        ],
        required: true
      },
      {
        title: 'Describe brevemente tu oficio',
        description: '¿Qué creas y qué te hace único?',
        inputType: 'textarea',
        placeholder: 'Ej: Creo muñecos tejidos a mano con técnicas tradicionales...',
        validation: [
          { type: 'required' },
          { type: 'min-length', value: 20 },
          { type: 'max-length', value: 500 }
        ],
        required: true
      },
      {
        title: '¿Cuántos años llevas en este oficio?',
        inputType: 'number',
        min: 0,
        max: 50,
        validation: [{ type: 'required' }, { type: 'number' }],
        required: true
      }
    ]
  },
  
  'brand': {
    'evaluate-identity': [
      {
        title: '¿Ya tienes un logo para tu negocio?',
        description: 'Necesitamos saber si ya cuentas con identidad visual',
        inputType: 'radio',
        options: ['Sí, tengo logo', 'No, aún no tengo', 'Tengo uno pero no estoy seguro si es bueno'],
        validation: [{ type: 'required' }],
        required: true
      },
      {
        title: 'Sube tu logo actual para evaluación',
        description: 'Analizaremos calidad, formato y versatilidad',
        inputType: 'file',
        accept: 'image/*',
        validation: [
          { type: 'file-type', value: 'image', message: 'Solo se aceptan imágenes' },
          { type: 'file-size', value: 5 }
        ],
        required: false,
        conditionalOn: { stepIndex: 0, value: 'Sí, tengo logo' }
      },
      {
        title: '¿Tienes colores corporativos definidos?',
        description: 'Colores que usas consistentemente en tu negocio',
        inputType: 'radio',
        options: ['Sí, tengo paleta definida', 'Uso colores pero sin sistema', 'No tengo colores definidos'],
        validation: [{ type: 'required' }],
        required: true
      },
      {
        title: 'Ingresa tus colores actuales',
        description: 'Selecciona los 3-5 colores principales que usas',
        inputType: 'color-picker',
        maxColors: 5,
        validation: [{ type: 'min-items', value: 1 }],
        required: false,
        conditionalOn: { stepIndex: 2, value: 'Sí, tengo paleta definida' }
      },
      {
        title: '¿Tienes un slogan o claim definido?',
        description: 'Una frase que identifique tu propuesta de valor',
        inputType: 'radio',
        options: ['Sí, tengo claim', 'Tengo ideas pero no definido', 'No tengo'],
        validation: [{ type: 'required' }],
        required: true
      },
      {
        title: 'Escribe tu claim actual',
        description: 'Lo evaluaremos en claridad, memorabilidad y diferenciación',
        inputType: 'textarea',
        placeholder: 'Ej: Tradición tejida con amor, cada pieza cuenta una historia...',
        validation: [
          { type: 'min-length', value: 10 },
          { type: 'max-length', value: 200 }
        ],
        required: false,
        conditionalOn: { stepIndex: 4, value: 'Sí, tengo claim' }
      },
      {
        title: '¿Dónde usas tu identidad actualmente?',
        description: 'Selecciona todos los lugares donde aplicas tu marca',
        inputType: 'checkbox',
        options: [
          'Redes sociales',
          'Etiquetas de productos',
          'Empaques',
          'Tarjetas de presentación',
          'Sitio web',
          'Punto de venta físico',
          'Material promocional'
        ],
        validation: [{ type: 'min-items', value: 1 }],
        required: true
      }
    ],
    'storytelling': [
      {
        title: 'Cuenta tu historia artesanal',
        description: '¿Cómo comenzaste? ¿Qué te inspira?',
        inputType: 'textarea',
        placeholder: 'Ej: Aprendí este oficio de mi abuela, quien me enseñó...',
        validation: [
          { type: 'required' },
          { type: 'min-length', value: 50 },
          { type: 'max-length', value: 1000 }
        ],
        required: true
      }
    ]
  },
  
  'shop': {
    'first-product': [
      {
        title: 'Nombre del producto',
        description: 'Usa un nombre descriptivo y atractivo',
        inputType: 'text',
        placeholder: 'Ej: Muñeco Tejido - Osito Caféño',
        validation: [
          { type: 'required' },
          { type: 'min-length', value: 3 }
        ],
        required: true
      },
      {
        title: 'Fotos del producto',
        description: 'Sube entre 3-5 fotos desde diferentes ángulos',
        inputType: 'multi-file',
        accept: 'image/*',
        maxFiles: 5,
        validation: [
          { type: 'required', message: 'Debes subir al menos 1 foto' },
          { type: 'file-size', value: 5 }
        ],
        required: true
      },
      {
        title: 'Descripción del producto',
        description: 'Detalla materiales, tamaño, tiempo de elaboración',
        inputType: 'textarea',
        placeholder: 'Ej: Muñeco tejido 100% a mano con lana natural. Mide 25cm...',
        validation: [
          { type: 'required' },
          { type: 'min-length', value: 30 }
        ],
        required: true
      },
      {
        title: 'Precio',
        description: '¿Cuánto vale tu trabajo?',
        inputType: 'number',
        prefix: '$',
        min: 1000,
        validation: [
          { type: 'required' },
          { type: 'number' }
        ],
        required: true
      },
      {
        title: 'Cantidad disponible',
        description: '¿Cuántas unidades tienes listas?',
        inputType: 'number',
        min: 0,
        validation: [
          { type: 'required' },
          { type: 'number' }
        ],
        required: true
      }
    ],
    'shop-setup': [
      {
        title: 'Banner de tu tienda',
        description: 'Imagen principal que verán tus visitantes',
        inputType: 'file',
        accept: 'image/*',
        validation: [
          { type: 'file-size', value: 10 }
        ],
        required: false
      },
      {
        title: 'Descripción de tu tienda',
        description: 'Cuéntale a tus clientes sobre tu taller',
        inputType: 'textarea',
        validation: [
          { type: 'required' },
          { type: 'min-length', value: 50 }
        ],
        required: true
      }
    ]
  },
  
  'sales': {
    'pricing-strategy': [
      {
        title: 'Costo de materiales por producto',
        description: '¿Cuánto gastas en materiales para una unidad?',
        inputType: 'number',
        prefix: '$',
        validation: [
          { type: 'required' },
          { type: 'number' }
        ],
        required: true
      },
      {
        title: 'Horas de trabajo por producto',
        description: '¿Cuánto tiempo te toma crear una pieza?',
        inputType: 'number',
        suffix: 'horas',
        validation: [
          { type: 'required' },
          { type: 'number' }
        ],
        required: true
      },
      {
        title: 'Precio por hora de tu trabajo',
        description: '¿Cuánto vale tu hora de trabajo artesanal?',
        inputType: 'number',
        prefix: '$',
        helpText: 'Considera tu experiencia y calidad',
        validation: [
          { type: 'required' },
          { type: 'number' }
        ],
        required: true
      }
    ]
  },
  
  'community': {
    'social-media': [
      {
        title: '¿En qué redes sociales estás?',
        description: 'Selecciona todas las que uses',
        inputType: 'checkbox',
        options: ['Instagram', 'Facebook', 'WhatsApp Business', 'TikTok', 'Pinterest', 'YouTube'],
        validation: [{ type: 'required' }],
        required: true
      },
      {
        title: 'Link de tu Instagram (si tienes)',
        inputType: 'text',
        placeholder: 'https://instagram.com/tu_negocio',
        validation: [{ type: 'url' }],
        required: false
      },
      {
        title: '¿Con qué frecuencia publicas contenido?',
        inputType: 'radio',
        options: ['Diariamente', '2-3 veces por semana', 'Semanalmente', 'Ocasionalmente'],
        validation: [{ type: 'required' }],
        required: true
      }
    ]
  }
};

export const getMilestoneSteps = (milestoneId: string, actionId: string): WizardStep[] => {
  const milestone = MILESTONE_WIZARDS[milestoneId];
  if (!milestone) return [];
  
  return milestone[actionId] || [];
};
