/**
 * Reset seed runner para el CMS.
 *
 * Uso (desde apps/api):
 *   npm run cms:reset-seed
 *
 * A diferencia de `cms.seed-runner.ts`, este runner es DESTRUCTIVO:
 *   1. Borra TODOS los documentos de `cms_pages`.
 *   2. Borra TODOS los registros de `cms_seed_skips`.
 *   3. Re-siembra desde cero a partir de los `*.seed.ts`.
 *
 * Está pensado para alinear el contenido editorial con las maquetas:
 * deja el CMS en el estado exacto del seed, ignorando ediciones manuales
 * y duplicados acumulados por corridas anteriores del runner aditivo.
 *
 * NO toca otras colecciones del CMS (`blog_posts`, `collections`,
 * `cms_territories`). Esas se mantienen y, si están vacías, las pueblan
 * los seeders aditivos del runner principal.
 *
 * Independencia: este runner NO bootea `AppModule`; abre Mongo
 * directamente con mongoose. Así no requiere que Postgres esté
 * disponible para correr.
 *
 * Seguridad: requiere confirmación explícita en producción mediante la
 * env `CMS_RESET_CONFIRM=YES`. En dev/stage corre sin prompt.
 */
import 'dotenv/config';
import * as mongoose from 'mongoose';
import { randomUUID } from 'crypto';
import { CmsPageSchema, CmsPageSection } from '../schemas/cms-page.schema';
import { CmsSeedSkipSchema } from '../schemas/cms-seed-skip.schema';
import { CmsSection } from '../types/cms-section.types';
import { tecnicasSeedSections } from './tecnicas.seed';
import { homeSeedSections } from './home.seed';
import { coleccionesSeedSections } from './colecciones.seed';
import { territoriosSeedSections } from './territorios.seed';
import { sobreTelarSeedSections } from './sobre-telar.seed';
import { historiasSeedSections } from './historias.seed';
import { contentPicksSeedSections } from './content-picks.seed';

type SeedSection = Omit<CmsSection, 'id' | 'createdAt' | 'updatedAt'>;

function buildMongoUri(): string {
  const explicit = process.env.MONGO_URI;
  if (explicit) return explicit;

  const protocol = process.env.MONGO_PROTOCOL ?? 'mongodb+srv';
  const user = process.env.MONGO_USER;
  const pass = process.env.MONGO_PASS;
  const host = process.env.MONGO_HOST;
  const name = process.env.MONGO_NAME ?? 'stage';
  const authSource = process.env.MONGO_AUTH_SOURCE ?? 'admin';
  if (!user || !pass || !host) {
    return 'mongodb://localhost:27017/telar_cms';
  }
  return `${protocol}://${encodeURIComponent(user)}:${encodeURIComponent(
    pass,
  )}@${host}/${name}?authSource=${authSource}`;
}

function groupByPageKey(
  sections: SeedSection[],
): Map<string, SeedSection[]> {
  const map = new Map<string, SeedSection[]>();
  for (const s of sections) {
    const arr = map.get(s.pageKey) ?? [];
    arr.push(s);
    map.set(s.pageKey, arr);
  }
  return map;
}

async function run() {
  const env =
    process.env.ENVIRONMENT_PROJECT ?? process.env.NODE_ENV ?? 'dev';
  const isProduction = env === 'production' || env === 'prod';
  if (isProduction && process.env.CMS_RESET_CONFIRM !== 'YES') {
    console.error(
      'Refusing to run reset-seed in production without CMS_RESET_CONFIRM=YES',
    );
    process.exit(1);
  }

  const uri = buildMongoUri();
  const safeUri = uri.replace(/\/\/([^:]+):[^@]+@/, '//$1:***@');
  console.info(`[CmsResetSeed] env=${env} mongo=${safeUri}`);

  const m = await mongoose.connect(uri);

  const PageModel = m.model('CmsPage', CmsPageSchema, 'cms_pages');
  const SkipModel = m.model(
    'CmsSeedSkip',
    CmsSeedSkipSchema,
    'cms_seed_skips',
  );

  const pagesBefore = await PageModel.countDocuments({});
  const skipsBefore = await SkipModel.countDocuments({});
  console.info(
    `[CmsResetSeed] antes del reset: cms_pages=${pagesBefore}, cms_seed_skips=${skipsBefore}`,
  );

  const delPages = await PageModel.deleteMany({});
  const delSkips = await SkipModel.deleteMany({});
  console.info(
    `[CmsResetSeed] borrados: cms_pages=${delPages.deletedCount}, cms_seed_skips=${delSkips.deletedCount}`,
  );

  // Agregamos los content_picks al pool de secciones por pageKey.
  const allSections: SeedSection[] = [
    ...tecnicasSeedSections,
    ...homeSeedSections,
    ...coleccionesSeedSections,
    ...territoriosSeedSections,
    ...sobreTelarSeedSections,
    ...historiasSeedSections,
    ...contentPicksSeedSections,
  ];

  const byPage = groupByPageKey(allSections);

  for (const [pageKey, sections] of byPage) {
    const ordered = [...sections].sort((a, b) => a.position - b.position);
    const docSections: CmsPageSection[] = ordered.map((s) => ({
      id: randomUUID(),
      type: s.type,
      position: s.position,
      published: !!s.published,
      payload: s.payload ?? {},
    }));
    await PageModel.create({ pageKey, sections: docSections });
    console.info(
      `[CmsResetSeed] [${pageKey}] insertadas ${docSections.length} secciones`,
    );
  }

  const pagesAfter = await PageModel.countDocuments({});
  const totalSectionsAgg = await PageModel.aggregate([
    { $project: { count: { $size: { $ifNull: ['$sections', []] } } } },
    { $group: { _id: null, total: { $sum: '$count' } } },
  ]);
  const totalSections = totalSectionsAgg[0]?.total ?? 0;
  console.info(
    `[CmsResetSeed] reset completo. cms_pages=${pagesAfter}, secciones totales=${totalSections}`,
  );

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('Reset seed failed:', err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
