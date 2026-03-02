import { Module } from '@nestjs/common';
import { InventoryMovementsService } from './inventory-movements.service';
import { InventoryMovementsController } from './inventory-movements.controller';
import { inventoryMovementsProviders } from './inventory-movements.providers';
import { DatabaseModule } from 'src/config/configOrm.module';

@Module({
  imports: [DatabaseModule],
  controllers: [InventoryMovementsController],
  providers: [...inventoryMovementsProviders, InventoryMovementsService],
  exports: [InventoryMovementsService],
})
export class InventoryMovementsModule {}
