import * as mongoose from 'mongoose';
import {
  CollectionSchema,
  CollectionDocument,
} from './schemas/collection.schema';

/** Reusa MONGO_DATA_SOURCE de cms-sections; sólo registra el modelo. */
export const collectionsProviders = [
  {
    provide: 'COLLECTION_MODEL',
    useFactory: (m: typeof mongoose) =>
      m.model<CollectionDocument>('Collection', CollectionSchema, 'collections'),
    inject: ['MONGO_DATA_SOURCE'],
  },
];
