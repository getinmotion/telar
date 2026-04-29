/**
 * Seed runner para el CMS.
 *
 * Uso (desde apps/api):
 *   npm run cms:seed
 *
 * Idempotente: si la página ya existe en Mongo no la sobrescribe — solo
 * inserta secciones faltantes (matched por `pageKey + type + position`).
 */
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AppModule } from '../../../app.module';
import { CmsSectionsService } from '../cms-sections.service';
import { tecnicasSeedSections } from './tecnicas.seed';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const log = new Logger('CmsSeed');
  try {
    const svc = app.get(CmsSectionsService);

    const existing = await svc.findAllByPage('tecnicas', true);
    let inserted = 0;

    for (const section of tecnicasSeedSections) {
      const already = existing.find(
        (s) => s.type === section.type && s.position === section.position,
      );
      if (already) {
        log.log(
          `skip pageKey=tecnicas type=${section.type} position=${section.position} (ya existe)`,
        );
        continue;
      }
      await svc.create({
        pageKey: section.pageKey,
        type: section.type,
        position: section.position,
        published: section.published,
        payload: section.payload,
      });
      inserted += 1;
      log.log(
        `created pageKey=tecnicas type=${section.type} position=${section.position}`,
      );
    }

    log.log(`Seed completo. Insertadas: ${inserted}, ya existentes: ${
      tecnicasSeedSections.length - inserted
    }`);
    // Quiet the linter about the unused randomUUID import in case the runner
    // grows a force-overwrite mode later.
    void randomUUID;
  } finally {
    await app.close();
  }
}

bootstrap().catch((err) => {

  console.error('Seed failed:', err);
  process.exit(1);
});
