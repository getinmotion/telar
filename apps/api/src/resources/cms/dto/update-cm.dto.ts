import { PartialType } from '@nestjs/swagger';
import { CreateCmDto } from './create-cm.dto';

export class UpdateCmDto extends PartialType(CreateCmDto) {}
