import { DataSource } from 'typeorm';
import { Material } from './entities/material.entity';

export const materialsProviders = [
  {
    provide: 'MATERIALS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Material),
    inject: ['DATA_SOURCE'],
  },
];
