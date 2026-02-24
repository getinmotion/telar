import { Module } from '@nestjs/common';
import { databaseProviders } from './configOrm.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
