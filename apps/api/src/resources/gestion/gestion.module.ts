import { Module, forwardRef } from '@nestjs/common';
import { GestionController } from './gestion.controller';
import { GestionService } from './gestion.service';
import { DatabaseModule } from 'src/config/configOrm.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [GestionController],
  providers: [GestionService],
  exports: [GestionService],
})
export class GestionModule {}
