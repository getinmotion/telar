import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductStoreEmbeddingTables1773500000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================================
    // 1. EXTENSION pgvector
    // ============================================================
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);

    // ============================================================
    // 2. TABLA: shop.product_embeddings
    //    Tabla satelite 1-a-1 de shop.products_core.
    //    Almacena el vector, el texto fuente y metadata de version
    //    para poder reindexar selectivamente.
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS shop.product_embeddings (
        product_id    UUID        PRIMARY KEY
                                  REFERENCES shop.products_core(id)
                                  ON DELETE CASCADE,
        embedding     vector(1536) NOT NULL,
        model         TEXT        NOT NULL DEFAULT 'text-embedding-3-small',
        semantic_text TEXT        NOT NULL,
        version       INTEGER     NOT NULL DEFAULT 1,
        generated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    // ============================================================
    // 3. TABLA: shop.store_embeddings
    //    Reservada para busqueda semantica de tiendas/artesanos.
    //    Misma estructura que product_embeddings.
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS shop.store_embeddings (
        store_id      UUID        PRIMARY KEY
                                  REFERENCES shop.stores(id)
                                  ON DELETE CASCADE,
        embedding     vector(1536) NOT NULL,
        model         TEXT        NOT NULL DEFAULT 'text-embedding-3-small',
        semantic_text TEXT        NOT NULL,
        version       INTEGER     NOT NULL DEFAULT 1,
        generated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    // ============================================================
    // 4. INDICES HNSW (cosine similarity)
    //    HNSW es preferido sobre IVFFlat para volumenes < 1M filas:
    //    mejor recall y no requiere entrenamiento previo.
    // ============================================================
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_product_embeddings_hnsw
        ON shop.product_embeddings
        USING hnsw (embedding vector_cosine_ops)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_store_embeddings_hnsw
        ON shop.store_embeddings
        USING hnsw (embedding vector_cosine_ops)
    `);

    // Indice en version para queries de reindexado selectivo
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_product_embeddings_version
        ON shop.product_embeddings (version)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_store_embeddings_version
        ON shop.store_embeddings (version)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS shop.idx_store_embeddings_version`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS shop.idx_product_embeddings_version`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS shop.idx_store_embeddings_hnsw`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS shop.idx_product_embeddings_hnsw`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS shop.store_embeddings`);
    await queryRunner.query(`DROP TABLE IF EXISTS shop.product_embeddings`);
  }
}
