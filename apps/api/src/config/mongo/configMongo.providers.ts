import * as mongoose from 'mongoose';

const ENV: string = process.env.ENVIRONMENT_PROJECT ?? 'dev';

/**
 * Mongo respalda solo el CMS (blog-posts, collections, cms-sections,
 * cms-territories); el catálogo, las tiendas y la taxonomía viven en Postgres.
 *
 * En dev, si Atlas no responde (típicamente porque la IP de la máquina no está
 * en la whitelist al cambiar de red) devolvemos la instancia sin conectar en vez
 * de rechazar: la API arranca, todo lo de Postgres funciona y solo los endpoints
 * de CMS fallan — el marketplace ya cae a su contenido de fallback.
 *
 * En producción se mantiene el fallo duro: arrancar sin CMS ahí sería servir el
 * sitio a medias sin que nadie se entere.
 */
export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async (): Promise<typeof mongoose> => {
      const uri =
        process.env.MONGO_URI ||
        `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}/${process.env.MONGO_NAME}?authSource=${process.env.MONGO_AUTH_SOURCE || 'admin'}`;

      try {
        return await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 10000,
        });
      } catch (error) {
        console.error('Error en la conexion de MongoDB', error);

        if (ENV === 'production') throw error;

        console.warn(
          '⚠️  MongoDB no disponible: la API arranca sin CMS. Los endpoints de blog, colecciones y cms-* fallarán. Si es por IP, añádela en Atlas → Network Access.',
        );
        return mongoose;
      }
    },
  },
];
