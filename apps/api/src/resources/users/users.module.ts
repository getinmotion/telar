import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { usersProviders } from './users.providers';
import { UserRolesModule } from '../user-roles/user-roles.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, UserRolesModule, forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [...usersProviders, UsersService],
  exports: [UsersService, ...usersProviders],
})
export class UsersModule {}
