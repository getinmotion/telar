/**
 * Artisan Profile (display-only) types
 *
 * Mirrors the read side of `ArtisanProfileData`
 * (apps/artisans-web/src/types/artisanProfile.ts), which the wizard in
 * artisans-web persists as JSON into `artisan_shops.artisan_profile`.
 * Marketplace-web only ever reads this blob, so it keeps a trimmed,
 * fully-optional copy with just the fields actually rendered here —
 * following the existing pattern of `ArtisanShop` being duplicated
 * independently between the two apps instead of imported cross-app.
 */

/**
 * AI-generated narrative produced on publish.
 * Shape mirrors the REAL backend payload
 * (apps/artisans-web/src/services/ai.actions.ts → ArtisanProfileHistoryResponse
 * and apps/api/.../ai/services/artisan-profile-history.service.ts).
 * NOTE: this intentionally differs from the stale `ArtisanGeneratedStory`
 * declared in artisans-web's artisanProfile.ts, which does not match runtime data.
 */
export interface ArtisanTimelineEvent {
  year?: string;
  event?: string;
}

export interface ArtisanGeneratedStory {
  heroTitle?: string;
  heroSubtitle?: string;
  claim?: string;
  timeline?: ArtisanTimelineEvent[];
  originStory?: string;
  culturalStory?: string;
  craftStory?: string;
  workshopStory?: string;
  artisanQuote?: string;
  closingMessage?: string;
}

export interface ArtisanProfileDisplayData {
  // Identidad
  artisanName?: string;
  artisticName?: string;
  shortBio?: string;
  artisanPhoto?: string;
  startAge?: number;

  // Historia / origen
  learnedFrom?: string;
  learnedFromDetail?: string;
  culturalMeaning?: string;
  motivation?: string;
  craftMessage?: string;
  country?: string;
  department?: string;
  municipality?: string;
  communityVillage?: string;
  ethnicRelation?: string;
  regionalHistory?: string;

  // Arte / producto
  productDescription?: string;
  uniqueness?: string;

  // Oficio / técnica (IDs → resolver con catálogo; y arrays legacy con nombres)
  craftId?: string;
  craftIds?: string[];
  techniqueIds?: string[];
  materialIds?: string[];
  techniques?: string[];
  materials?: string[];

  // Taller
  workshopPhoto?: string;
  workshopActionPhoto?: string;
  workshopToolsPhoto?: string;
  workshopPhotos?: string[];
  workshopDescription?: string;
  creationProcess?: string;
  workshopTools?: string[];

  // Relato IA (publicación)
  generatedStory?: ArtisanGeneratedStory;
}

/**
 * value → label maps para códigos del wizard.
 * Duplicados mínimos de LEARNED_FROM_OPTIONS / ETHNIC_RELATION_OPTIONS
 * en apps/artisans-web/src/types/artisanProfile.ts (no import cross-app).
 */
export const LEARNED_FROM_LABELS: Record<string, string> = {
  family: 'Crecí viéndolo en mi familia',
  community: 'Lo aprendí de mi comunidad',
  master: 'Un maestro me enseñó',
  'self-taught': 'Lo descubrí por mi cuenta',
  school: 'Estudié o me formé en eso',
  mixed: 'He mezclado varios caminos',
  other: 'Otro camino',
};

export const ETHNIC_RELATION_LABELS: Record<string, string> = {
  indigena: 'Indígena',
  afro: 'Afrodescendiente',
  campesina: 'Campesina',
  raizal: 'Raizal',
  palenquera: 'Palenquera',
  rrom: 'Rrom',
  otra: 'Otra',
};
