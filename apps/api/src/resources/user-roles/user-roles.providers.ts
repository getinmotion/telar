import { DataSource } from 'typeorm';
import { UserRole } from './entities/user-role.entity';

export const userRolesProviders = [
  {
    provide: 'USER_ROLES_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(UserRole),
    inject: ['DATA_SOURCE'],
  },
];
