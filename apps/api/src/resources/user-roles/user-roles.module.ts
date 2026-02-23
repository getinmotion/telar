import { Module } from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import { UserRolesController } from './user-roles.controller';
import { userRolesProviders } from './user-roles.providers';
import { DatabaseModule } from 'src/config/configOrm.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UserRolesController],
  providers: [...userRolesProviders, UserRolesService],
  exports: [UserRolesService],
})
export class UserRolesModule {}
