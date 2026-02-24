import { Module, forwardRef } from '@nestjs/common';
import { AgentTasksService } from './agent-tasks.service';
import { AgentTasksController } from './agent-tasks.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { agentTasksProviders } from './agent-tasks.providers';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [AgentTasksController],
  providers: [...agentTasksProviders, AgentTasksService],
  exports: [AgentTasksService, ...agentTasksProviders],
})
export class AgentTasksModule {}
