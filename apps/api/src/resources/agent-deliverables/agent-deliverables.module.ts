import { Module } from '@nestjs/common';
import { AgentDeliverablesService } from './agent-deliverables.service';
import { AgentDeliverablesController } from './agent-deliverables.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { agentDeliverablesProviders } from './agent-deliverables.providers';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [AgentDeliverablesController],
  providers: [...agentDeliverablesProviders, AgentDeliverablesService],
  exports: [AgentDeliverablesService, ...agentDeliverablesProviders],
})
export class AgentDeliverablesModule {}
