// Types for Artisan Profile wizard and public display

export interface ArtisanProfileData {
  // Step 1: Identidad
  artisanName: string;
  artisticName: string;
  shortBio?: string;
  artisanPhoto?: string;
  artisanVideo?: string;
  craftId?: string;          // UUID del oficio principal (FK → crafts)

  // Step 2: Historia y tradición
  learnedFrom: string;
  startAge: number;
  learnedFromDetail: string;
  culturalMeaning: string;
  motivation: string;
  craftMessage: string;       // filosofía del oficio

  // Territorio (Step 2)
  country: string;
  department?: string;
  municipality?: string;
  communityVillage?: string;
  ethnicRelation?: string;
  regionalHistory?: string;

  // Step 3: Taller y proceso
  workshopPhoto?: string;       // foto taller (obligatorio, single)
  workshopActionPhoto?: string; // foto trabajando (recomendado)
  workshopToolsPhoto?: string;  // foto herramientas (opcional)
  workshopDescription: string;
  creationProcess?: string;
  workshopTools: string[];

  // Step 4: Arte y estilo
  techniques: string[];
  materials: string[];
  uniqueness: string;
  craftStyle: string[];

  // Legacy fields — kept for backwards compatibility
  workshopPhotos?: string[];
  workshopAddress?: string;
  workshopVideo?: string;
  averageTime?: string;
  culturalHistory?: string;
  ancestralKnowledge?: string;
  territorialImportance?: string;

  // Metadata
  completedAt?: string;
  generatedStory?: ArtisanGeneratedStory;
}

export interface ArtisanGeneratedStory {
  heroTitle: string;
  heroSubtitle: string;
  originNarrative: string;
  culturalNarrative: string;
  craftNarrative: string;
  closingMessage: string;
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

export const LEARNED_FROM_OPTIONS = [
  { value: 'parents',     label: 'Padres' },
  { value: 'grandparents', label: 'Abuelos' },
  { value: 'community',   label: 'Comunidad' },
  { value: 'school',      label: 'Escuela o instituto' },
  { value: 'self-taught', label: 'Autodidacta' },
  { value: 'master',      label: 'Maestro artesano' },
  { value: 'other',       label: 'Otro' },
];

export const ETHNIC_RELATION_OPTIONS = [
  { value: 'ninguna',    label: 'Ninguna' },
  { value: 'indigena',   label: 'Indígena' },
  { value: 'afro',       label: 'Afrodescendiente' },
  { value: 'campesina',  label: 'Campesina' },
  { value: 'raizal',     label: 'Raizal' },
  { value: 'palenquera', label: 'Palenquera' },
  { value: 'rrom',       label: 'Rrom' },
  { value: 'otra',       label: 'Otra' },
  { value: 'no-decir',   label: 'Prefiero no decir' },
];

export const CRAFT_STYLE_OPTIONS = [
  'Tradicional', 'Contemporáneo', 'Fusión', 'Minimalista',
  'Colorido', 'Experimental', 'Funcional', 'Decorativo',
];

export const DEFAULT_ARTISAN_PROFILE: ArtisanProfileData = {
  artisanName: '',
  artisticName: '',
  shortBio: '',
  learnedFrom: '',
  startAge: 0,
  learnedFromDetail: '',
  culturalMeaning: '',
  motivation: '',
  craftMessage: '',
  country: 'Colombia',
  department: '',
  municipality: '',
  communityVillage: '',
  ethnicRelation: '',
  regionalHistory: '',
  workshopPhoto: '',
  workshopActionPhoto: '',
  workshopToolsPhoto: '',
  workshopPhotos: [],
  workshopDescription: '',
  creationProcess: '',
  workshopTools: [],
  techniques: [],
  materials: [],
  uniqueness: '',
  craftStyle: [],
};
