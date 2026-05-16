import { DataSource } from 'typeorm';
import { MarketplaceAssignment } from './entities/marketplace-assignment.entity';

export const marketplaceAssignmentsProviders = [
  {
    provide: 'MARKETPLACE_ASSIGNMENTS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(MarketplaceAssignment),
    inject: ['DATA_SOURCE'],
  },
];
