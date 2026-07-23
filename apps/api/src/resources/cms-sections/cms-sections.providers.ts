import * as mongoose from 'mongoose';
import { CmsPageSchema, CmsPageDocument } from './schemas/cms-page.schema';
import {
  CmsSeedSkipSchema,
  CmsSeedSkipDocument,
} from './schemas/cms-seed-skip.schema';

/**
 * Proveedores de modelos Mongo para el CMS.
 * La conexión a Mongo se obtiene desde ConfigMongoModule (token DATA_SOURCE).
 */
export const cmsSectionsProviders = [
  {
    provide: 'CMS_PAGE_MODEL',
    useFactory: (m: typeof mongoose) =>
      m.model<CmsPageDocument>('CmsPage', CmsPageSchema, 'cms_pages'),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'CMS_SEED_SKIP_MODEL',
    useFactory: (m: typeof mongoose) =>
      m.model<CmsSeedSkipDocument>(
        'CmsSeedSkip',
        CmsSeedSkipSchema,
        'cms_seed_skips',
      ),
    inject: ['DATA_SOURCE'],
  },
];
