import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';

const ENV: string = process.env.ENVIRONMENT_PROJECT ?? 'dev';

const TYPEORM_ROUTE_FILES: any = {
  dev: {
    migrations: ['src/migrations/**/*.ts'],
  },
  production: {
    migrations: ['dist/migrations/**/*.js'],
  },
};

const { migrations } = TYPEORM_ROUTE_FILES[ENV];

config();

const configService = new ConfigService();

const dataSource = new DataSource({
  type: 'postgres',
  host: configService.get('HOST_DB'),
  port: configService.get('PORT_DB'),
  username: configService.get('USER_DB'),
  password: configService.get('PASS_DB'),
  database: configService.get('NAME_DB'),
  migrations,
  migrationsTableName: 'migrations',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: false,
});

console.info('🐬 Conectado a la DB:', dataSource.options.database);

export default dataSource;
