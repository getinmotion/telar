/**
 * DataSource solo para ejecutar migraciones en producción (Docker).
 * Usa solo process.env; no requiere dotenv ni @nestjs/config.
 * Uso: npm run migration:run:prod
 */
const { DataSource } = require('typeorm');

module.exports = new DataSource({
  type: 'postgres',
  host: process.env.HOST_DB,
  port: parseInt(process.env.PORT_DB || '5432', 10),
  username: process.env.USER_DB,
  password: process.env.PASS_DB,
  database: process.env.NAME_DB,
  migrations: ['dist/migrations/**/*.js'],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: false,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
