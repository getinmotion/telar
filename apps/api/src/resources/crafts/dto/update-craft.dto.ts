import { PartialType } from '@nestjs/swagger';
import { CreateCraftDto } from './create-craft.dto';

export class UpdateCraftDto extends PartialType(CreateCraftDto) {}
