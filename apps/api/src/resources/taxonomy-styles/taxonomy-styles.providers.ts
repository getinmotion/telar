import { DataSource } from 'typeorm';
import { Style } from './entities/style.entity';

export const taxonomyStylesProviders = [
  {
    provide: 'STYLES_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Style),
    inject: ['DATA_SOURCE'],
  },
];
