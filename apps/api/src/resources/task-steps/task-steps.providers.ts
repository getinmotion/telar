import { DataSource } from 'typeorm';
import { TaskStep } from './entities/task-step.entity';

export const taskStepsProviders = [
  {
    provide: 'TASK_STEPS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(TaskStep),
    inject: ['DATA_SOURCE'],
  },
];
