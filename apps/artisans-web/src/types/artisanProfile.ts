// Types for Artisan Profile wizard and public display

export interface ArtisanProfileData {
  // Step 1: Identidad
  artisanName: string;
  artisticName: string;
  shortBio?: string;
  artisanPhoto?: string;
  artisanVideo?: string;
  craftId?: string;             // UUID del oficio principal (FK → crafts)
  primaryTechniqueId?: string;   // UUID de la técnica principal (FK → techniques)
  secondaryTechniqueId?: string; // UUID de la técnica secundaria (FK → techniques)
  materialIds?: string[];       // UUIDs de materiales del perfil (artisan_materials)

  // Step 2: Historia y tradición
  maestros: { id?: string; name: string; description?: string }[];
  noMaestro?: boolean;
  learnedFrom: string; // legacy, kept for backwards compat
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
  techniques: string[];       // legacy: nombres hardcoded (backwards compat)
  techniqueIds?: string[];    // new: UUIDs de técnicas filtradas por oficio
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
  { value: 'family',      icon: 'family_restroom', label: 'Crecí viéndolo en mi familia',    desc: 'Fue parte natural de crecer, lo vi desde pequeño/a' },
  { value: 'community',   icon: 'groups',          label: 'Lo aprendí de mi comunidad',       desc: 'La tradición de mi entorno me dio las primeras herramientas' },
  { value: 'master',      icon: 'person',          label: 'Un maestro me enseñó',             desc: 'Alguien con experiencia me formó en el oficio' },
  { value: 'self-taught', icon: 'explore',         label: 'Lo descubrí por mi cuenta',        desc: 'La curiosidad y la práctica fueron mis maestros' },
  { value: 'school',      icon: 'school',          label: 'Estudié o me formé en eso',        desc: 'Pasé por una institución o programa formal' },
  { value: 'mixed',       icon: 'merge',           label: 'He mezclado varios caminos',       desc: 'Mi aprendizaje viene de fuentes diversas' },
  { value: 'other',       icon: 'more_horiz',      label: 'Otro',                             desc: 'Mi historia es diferente a todas estas' },
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
  maestros: [],
  noMaestro: false,
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
  techniqueIds: [],
  materials: [],
  uniqueness: '',
  craftStyle: [],
};
