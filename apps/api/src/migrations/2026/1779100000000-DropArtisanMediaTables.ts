import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropArtisanMediaTables1779100000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "artisan_media_working" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "artisan_media_community" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "artisan_media_workshop" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "artisan_media_family" CASCADE`);
  }

  async down(_queryRunner: QueryRunner): Promise<void> {
    // Eliminación intencional — no se recrea
  }
}
