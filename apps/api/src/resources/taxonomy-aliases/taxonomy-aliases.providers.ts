import { DataSource } from 'typeorm';
import { TaxonomyAlias } from './entities/taxonomy-alias.entity';

export const taxonomyAliasesProviders = [
  {
    provide: 'TAXONOMY_ALIASES_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(TaxonomyAlias),
    inject: ['DATA_SOURCE'],
  },
];
