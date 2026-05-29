import * as mongoose from 'mongoose';
import {
  TerritorySchema,
  TerritoryDocument,
} from './schemas/cms-territory.schema';

/**
 * Reusa la conexión MONGO_DATA_SOURCE abierta por cms-sections. Solo registra
 * el modelo `CmsTerritory` (colección Mongo `territories`).
 */
export const cmsTerritoriesProviders = [
  {
    provide: 'CMS_TERRITORY_MODEL',
    useFactory: (m: typeof mongoose) =>
      m.model<TerritoryDocument>('CmsTerritory', TerritorySchema, 'territories'),
    inject: ['MONGO_DATA_SOURCE'],
  },
];
