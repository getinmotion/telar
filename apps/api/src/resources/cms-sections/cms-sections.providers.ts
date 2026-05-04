import * as mongoose from 'mongoose';
import { Logger } from '@nestjs/common';
import { CmsPageSchema, CmsPageDocument } from './schemas/cms-page.schema';

/**
 * Proveedores de Mongo para el CMS, alineados con la convención del repo
 * (un provider de DATA_SOURCE + un provider por modelo).
 *
 * `MONGO_DATA_SOURCE` abre la conexión a Atlas a partir de variables separadas:
 * USER, PASS, HOST, NAME, AUTH_SOURCE, PROTOCOL.
 *
 * `CMS_PAGE_MODEL` recibe la conexión y registra el modelo `CmsPage`.
 */
export const cmsSectionsProviders = [
  {
    provide: 'MONGO_DATA_SOURCE',
    useFactory: async (): Promise<typeof mongoose> => {
      const log = new Logger('MongoDataSource');

      // Override completo (útil para local con docker-compose / Mongo sin auth)
      const explicit = process.env.MONGO_URI;
      if (explicit) {
        try {
          await mongoose.connect(explicit);
          log.log('Mongo conectado (MONGO_URI override)');
          return mongoose;
        } catch (error) {
          log.error('Error conectando a Mongo (MONGO_URI)', error as Error);
          throw error;
        }
      }

      const protocol = process.env.MONGO_PROTOCOL ?? 'mongodb+srv';
      const user = process.env.MONGO_USER;
      const pass = process.env.MONGO_PASS;
      const host = process.env.MONGO_HOST;
      const name = process.env.MONGO_NAME ?? 'stage';
      const authSource = process.env.MONGO_AUTH_SOURCE ?? 'admin';

      if (!user || !pass || !host) {
        // Fallback a Mongo local sin auth — útil para arrancar offline.
        const fallback = 'mongodb://localhost:27017/telar_cms';
        log.warn(
          `MONGO_USER/PASS/HOST no configurados. Usando fallback ${fallback}`,
        );
        await mongoose.connect(fallback);
        return mongoose;
      }

      const uri = `${protocol}://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}/${name}?authSource=${authSource}`;
      try {
        await mongoose.connect(uri);
        log.log(`Mongo conectado a ${host}/${name}`);
        return mongoose;
      } catch (error) {
        log.error(
          `Error conectando a Mongo en ${host}/${name}`,
          error as Error,
        );
        throw error;
      }
    },
  },
  {
    provide: 'CMS_PAGE_MODEL',
    useFactory: (m: typeof mongoose) =>
      m.model<CmsPageDocument>('CmsPage', CmsPageSchema, 'cms_pages'),
    inject: ['MONGO_DATA_SOURCE'],
  },
];
