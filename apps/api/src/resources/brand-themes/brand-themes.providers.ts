import { DataSource } from 'typeorm';
import { BrandTheme } from './entities/brand-theme.entity';

export const brandThemesProviders = [
  {
    provide: 'BRAND_THEMES_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(BrandTheme),
    inject: ['DATA_SOURCE'],
  },
];

