import { DataSource } from 'typeorm';
import { InventoryMovement } from './entities/inventory-movement.entity';

export const inventoryMovementsProviders = [
  {
    provide: 'INVENTORY_MOVEMENTS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(InventoryMovement),
    inject: ['DATA_SOURCE'],
  },
];
