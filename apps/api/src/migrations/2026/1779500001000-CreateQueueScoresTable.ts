import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateQueueScoresTable1779500001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'queue_scores',
        schema: 'shop',
        columns: [
          {
            name: 'item_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'item_type',
            type: 'text',
            isPrimary: true,
          },
          {
            name: 'priority_score',
            type: 'int',
            default: 0,
          },
          {
            name: 'risk_score',
            type: 'int',
            default: 0,
          },
          {
            name: 'commercial_score',
            type: 'int',
            default: 0,
          },
          {
            name: 'score_reasons',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'computed_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'shop.queue_scores',
      new TableIndex({
        name: 'IDX_queue_scores_item_type',
        columnNames: ['item_type'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('shop.queue_scores', true);
  }
}
