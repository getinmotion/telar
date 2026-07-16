import * as mongoose from 'mongoose';
import {
  TerritorySchema,
  TerritoryDocument,
} from './schemas/cms-territory.schema';

/**
 * La conexión a Mongo se obtiene desde ConfigMongoModule (token DATA_SOURCE).
 */
export const cmsTerritoriesProviders = [
  {
    provide: 'CMS_TERRITORY_MODEL',
    useFactory: (m: typeof mongoose) =>
      m.model<TerritoryDocument>('CmsTerritory', TerritorySchema, 'territories'),
    inject: ['DATA_SOURCE'],
  },
];
