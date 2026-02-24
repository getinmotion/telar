import { Module } from '@nestjs/common';
import { TaskStepsService } from './task-steps.service';
import { TaskStepsController } from './task-steps.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { taskStepsProviders } from './task-steps.providers';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [TaskStepsController],
  providers: [...taskStepsProviders, TaskStepsService],
  exports: [TaskStepsService, ...taskStepsProviders],
})
export class TaskStepsModule {}
