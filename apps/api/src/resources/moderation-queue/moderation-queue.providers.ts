import { DataSource } from 'typeorm';
import { QueueScore } from './entities/queue-score.entity';

export const moderationQueueProviders = [
  {
    provide: 'QUEUE_SCORE_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(QueueScore),
    inject: ['DATA_SOURCE'],
  },
];
