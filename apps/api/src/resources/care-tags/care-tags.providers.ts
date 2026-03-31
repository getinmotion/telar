import { DataSource } from 'typeorm';
import { CareTag } from './entities/care-tag.entity';

export const careTagsProviders = [
  {
    provide: 'CARE_TAGS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(CareTag),
    inject: ['DATA_SOURCE'],
  },
];
