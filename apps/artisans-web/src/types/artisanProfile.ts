// Types for Artisan Profile wizard and public display

export interface ArtisanProfileData {
  // Step 1: Identity
  artisanName: string;
  artisticName: string;
  artisanPhoto?: string;
  artisanVideo?: string;
  
  // Step 2: Origin of craft
  learnedFrom: string;
  learnedFromDetail?: string;
  startAge: number;
  culturalMeaning: string;
  motivation: string;
  
  // Step 3: Cultural history
  culturalHistory: string;
  ethnicRelation: string;
  ancestralKnowledge: string;
  territorialImportance: string;
  
  // Step 4: Workshop
  workshopAddress?: string;
  workshopPhotos: string[];
  workshopVideo?: string;
  workshopDescription: string;
  
  // Step 5: Craft
  techniques: string[];
  materials: string[];
  averageTime: string;
  uniqueness: string;
  craftMessage: string;
  
  // Step 6: Human gallery
  workingPhotos: string[];
  communityPhotos: string[];
  familyPhotos: string[];
  
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
  { value: 'parents', label: 'Padres' },
  { value: 'grandparents', label: 'Abuelos' },
  { value: 'community', label: 'Comunidad' },
  { value: 'school', label: 'Escuela o instituto' },
  { value: 'self-taught', label: 'Autodidacta' },
  { value: 'master', label: 'Maestro artesano' },
  { value: 'other', label: 'Otro' },
];

export const DEFAULT_ARTISAN_PROFILE: ArtisanProfileData = {
  artisanName: '',
  artisticName: '',
  learnedFrom: '',
  startAge: 0,
  culturalMeaning: '',
  motivation: '',
  culturalHistory: '',
  ethnicRelation: '',
  ancestralKnowledge: '',
  territorialImportance: '',
  workshopPhotos: [],
  workshopDescription: '',
  techniques: [],
  materials: [],
  averageTime: '',
  uniqueness: '',
  craftMessage: '',
  workingPhotos: [],
  communityPhotos: [],
  familyPhotos: [],
};
