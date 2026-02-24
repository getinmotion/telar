import { DataSource } from 'typeorm';
import { AgentDeliverable } from './entities/agent-deliverable.entity';

export const agentDeliverablesProviders = [
  {
    provide: 'AGENT_DELIVERABLES_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(AgentDeliverable),
    inject: ['DATA_SOURCE'],
  },
];
