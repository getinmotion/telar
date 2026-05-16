import { DataSource } from 'typeorm';
import { Herramienta } from './entities/herramienta.entity';

export const taxonomyHerramientasProviders = [
  {
    provide: 'HERRAMIENTAS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Herramienta),
    inject: ['DATA_SOURCE'],
  },
];
