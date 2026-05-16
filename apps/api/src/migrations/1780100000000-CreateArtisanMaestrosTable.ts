import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArtisanMaestrosTable1780100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE artesanos.artisan_maestros (
        id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        artisan_id  UUID        NOT NULL,
        name        TEXT        NOT NULL,
        description TEXT        NULL,
        created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_artisan_maestros_artisan
          FOREIGN KEY (artisan_id)
          REFERENCES artesanos.artisan_profile(id)
          ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_artisan_maestros_artisan_id
      ON artesanos.artisan_maestros(artisan_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS artesanos.idx_artisan_maestros_artisan_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS artesanos.artisan_maestros;`);
  }
}
