import { PartialType } from '@nestjs/swagger';
import { CreateStyleDto } from './create-style.dto';

export class UpdateStyleDto extends PartialType(CreateStyleDto) {}
