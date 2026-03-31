import { DataSource } from 'typeorm';
import { CuratorialCategory } from './entities/curatorial-category.entity';

export const curatorialCategoriesProviders = [
  {
    provide: 'CURATORIAL_CATEGORIES_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CuratorialCategory),
    inject: ['DATA_SOURCE'],
  },
];
