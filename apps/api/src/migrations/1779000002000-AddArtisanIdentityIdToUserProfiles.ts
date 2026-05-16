import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddArtisanIdentityIdToUserProfiles1779000002000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE artesanos.artisan_profile
      ADD COLUMN IF NOT EXISTS artisan_identity_id uuid
        REFERENCES artesanos.artisan_identity(id) ON DELETE SET NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE artesanos.artisan_profile
      DROP COLUMN IF EXISTS artisan_identity_id;
    `);
  }
}
