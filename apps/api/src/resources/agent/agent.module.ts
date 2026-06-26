import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { UserProfilesModule } from '../user-profiles/user-profiles.module';
import { CategoriesModule } from '../categories/categories.module';

/**
 * Módulo puente para comunicación con el servicio de agentes
 * No incluye conexión a base de datos
 */
@Module({
  imports: [
    HttpModule.register({
      timeout: 30000, // 30 segundos de timeout
      maxRedirects: 5,
    }),
    ConfigModule,
    forwardRef(() => UserProfilesModule),
    forwardRef(() => CategoriesModule),
  ],
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService], // Exportar el servicio para que otros módulos puedan usarlo
})
export class AgentModule {}
