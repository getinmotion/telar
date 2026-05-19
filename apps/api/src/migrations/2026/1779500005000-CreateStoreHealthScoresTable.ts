import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStoreHealthScoresTable1779500005000 implements MigrationInterface {
  name = 'CreateStoreHealthScoresTable1779500005000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE shop.store_health_scores (
        store_id UUID PRIMARY KEY,
        score_total INTEGER NOT NULL DEFAULT 0,
        score_branding INTEGER NOT NULL DEFAULT 0,
        score_catalog INTEGER NOT NULL DEFAULT 0,
        score_narrative INTEGER NOT NULL DEFAULT 0,
        score_consistency INTEGER NOT NULL DEFAULT 0,
        last_computed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_store_health_scores_total ON shop.store_health_scores (score_total DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS shop.store_health_scores`);
  }
}
