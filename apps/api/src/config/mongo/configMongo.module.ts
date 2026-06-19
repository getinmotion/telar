import { Module } from '@nestjs/common';
import { databaseProviders } from './configMongo.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class ConfigMongoModule {}
