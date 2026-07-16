import * as mongoose from 'mongoose';
import {
  CollectionSchema,
  CollectionDocument,
} from './schemas/collection.schema';

/**
 * La conexión a Mongo se obtiene desde ConfigMongoModule (token DATA_SOURCE).
 */
export const collectionsProviders = [
  {
    provide: 'COLLECTION_MODEL',
    useFactory: (m: typeof mongoose) =>
      m.model<CollectionDocument>('Collection', CollectionSchema, 'collections'),
    inject: ['DATA_SOURCE'],
  },
];
