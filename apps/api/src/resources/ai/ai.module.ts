import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { OpenAIService } from './services/openai.service';
import { PromptsService } from './services/prompts.service';
import { MasterCoordinatorService } from './services/master-coordinator.service';
import { AuthModule } from '../auth/auth.module';
import { UserProfilesModule } from '../user-profiles/user-profiles.module';
import { UserMasterContextModule } from '../user-master-context/user-master-context.module';
import { UserMaturityScoresModule } from '../user-maturity-scores/user-maturity-scores.module';
import { ArtisanShopsModule } from '../artisan-shops/artisan-shops.module';
import { AgentTasksModule } from '../agent-tasks/agent-tasks.module';
import { TaskStepsModule } from '../task-steps/task-steps.module';
import { AgentDeliverablesModule } from '../agent-deliverables/agent-deliverables.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UserProfilesModule),
    forwardRef(() => UserMasterContextModule),
    forwardRef(() => UserMaturityScoresModule),
    forwardRef(() => ArtisanShopsModule),
    forwardRef(() => AgentTasksModule),
    forwardRef(() => TaskStepsModule),
    forwardRef(() => AgentDeliverablesModule),
  ],
  controllers: [AiController],
  providers: [
    AiService,
    OpenAIService,
    PromptsService,
    MasterCoordinatorService,
  ],
  exports: [AiService, MasterCoordinatorService],
})
export class AiModule {}
