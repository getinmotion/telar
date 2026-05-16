import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateShopModerationHistoryTable1779500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'shop_moderation_history',
        schema: 'shop',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'shop_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'previous_status',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'new_status',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'action_type',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'moderator_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'comment',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'edits_made',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'shop.shop_moderation_history',
      new TableIndex({
        name: 'IDX_shop_moderation_history_shop_id',
        columnNames: ['shop_id'],
      }),
    );

    await queryRunner.createIndex(
      'shop.shop_moderation_history',
      new TableIndex({
        name: 'IDX_shop_moderation_history_moderator_id',
        columnNames: ['moderator_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('shop.shop_moderation_history', true);
  }
}
