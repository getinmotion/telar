import { DataSource } from 'typeorm';
import { AgentTask } from './entities/agent-task.entity';

export const agentTasksProviders = [
  {
    provide: 'AGENT_TASKS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(AgentTask),
    inject: ['DATA_SOURCE'],
  },
];
