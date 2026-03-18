import { PartialType } from '@nestjs/swagger';
import { CreateCobreDto } from './create-cobre.dto';

export class UpdateCobreDto extends PartialType(CreateCobreDto) {}
