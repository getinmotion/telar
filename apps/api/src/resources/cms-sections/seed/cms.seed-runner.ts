/**
 * Seed runner para el CMS.
 *
 * Uso (desde apps/api):
 *   npm run cms:seed
 *
 * Idempotente:
 *  - Sections (cms_pages): match por `pageKey + type + position`.
 *  - Blog posts (blog_posts): match por `slug`.
 *  - Collections (collections): match por `slug`.
 */
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../../../app.module';
import { CmsSectionsService } from '../cms-sections.service';
import { CmsSection } from '../types/cms-section.types';
import { tecnicasSeedSections } from './tecnicas.seed';
import { homeSeedSections } from './home.seed';
import { coleccionesSeedSections } from './colecciones.seed';
import { contentPicksSeedSections } from './content-picks.seed';
import { BlogPostsService } from '../../blog-posts/blog-posts.service';
import { blogPostsSeed } from '../../blog-posts/seed/blog-posts.seed';
import { CollectionsService } from '../../collections/collections.service';
import { collectionsSeed } from '../../collections/seed/collections.seed';

async function seedPage(
  svc: CmsSectionsService,
  pageKey: string,
  sections: Omit<CmsSection, 'id' | 'createdAt' | 'updatedAt'>[],
  log: Logger,
) {
  const existing = await svc.findAllByPage(pageKey, true);
  let inserted = 0;

  for (const section of sections) {
    const already = existing.find(
      (s) => s.type === section.type && s.position === section.position,
    );
    if (already) {
      log.log(
        `skip pageKey=${pageKey} type=${section.type} position=${section.position} (ya existe)`,
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
      `created pageKey=${pageKey} type=${section.type} position=${section.position}`,
    );
  }

  log.log(
    `[${pageKey}] Insertadas: ${inserted}, ya existentes: ${sections.length - inserted}`,
  );
}

async function seedBlogPosts(svc: BlogPostsService, log: Logger) {
  let inserted = 0;
  let skipped = 0;
  for (const post of blogPostsSeed) {
    try {
      await svc.findBySlug(post.slug, { allowDraft: true });
      log.log(`skip blog-post slug=${post.slug} (ya existe)`);
      skipped += 1;
    } catch {
      await svc.create({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        body: post.body,
        coverUrl: post.coverUrl,
        coverAlt: post.coverAlt,
        category: post.category,
        authorName: post.authorName,
        readingTimeMin: post.readingTimeMin,
        status: post.status,
        publishedAt: post.publishedAt,
        keywords: post.keywords,
      });
      log.log(`created blog-post slug=${post.slug}`);
      inserted += 1;
    }
  }
  log.log(`[blog_posts] Insertadas: ${inserted}, ya existentes: ${skipped}`);
}

async function seedCollections(svc: CollectionsService, log: Logger) {
  let inserted = 0;
  let skipped = 0;
  for (const c of collectionsSeed) {
    try {
      await svc.findBySlug(c.slug, { allowDraft: true });
      log.log(`skip collection slug=${c.slug} (ya existe)`);
      skipped += 1;
    } catch {
      await svc.create({
        title: c.title,
        slug: c.slug,
        excerpt: c.excerpt,
        heroImageUrl: c.heroImageUrl ?? undefined,
        heroImageAlt: c.heroImageAlt ?? undefined,
        region: c.region ?? undefined,
        layoutVariant: c.layoutVariant,
        blocks: c.blocks,
        status: c.status,
        publishedAt: c.publishedAt,
        keywords: c.keywords,
      });
      log.log(`created collection slug=${c.slug}`);
      inserted += 1;
    }
  }
  log.log(`[collections] Insertadas: ${inserted}, ya existentes: ${skipped}`);
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const log = new Logger('CmsSeed');
  try {
    const cmsSvc = app.get(CmsSectionsService);
    const blogSvc = app.get(BlogPostsService);
    const collectionsSvc = app.get(CollectionsService);

    await seedPage(cmsSvc, 'tecnicas', tecnicasSeedSections, log);
    await seedPage(cmsSvc, 'home', homeSeedSections, log);
    await seedPage(cmsSvc, 'colecciones', coleccionesSeedSections, log);

    // content_picks pueden vivir en cualquier pageKey; agrupamos antes de sembrar
    const picksByPage = new Map<
      string,
      typeof contentPicksSeedSections
    >();
    for (const pick of contentPicksSeedSections) {
      const list = picksByPage.get(pick.pageKey) ?? [];
      list.push(pick);
      picksByPage.set(pick.pageKey, list);
    }
    for (const [pageKey, picks] of picksByPage) {
      await seedPage(cmsSvc, pageKey, picks, log);
    }
    await seedBlogPosts(blogSvc, log);
    await seedCollections(collectionsSvc, log);

    log.log('Seed completo.');
  } finally {
    await app.close();
  }
}

bootstrap().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
