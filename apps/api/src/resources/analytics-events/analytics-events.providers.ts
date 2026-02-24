import { DataSource } from 'typeorm';
import { AnalyticsEvent } from './entities/analytics-event.entity';

export const analyticsEventsProviders = [
  {
    provide: 'ANALYTICS_EVENTS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(AnalyticsEvent),
    inject: ['DATA_SOURCE'],
  },
];
