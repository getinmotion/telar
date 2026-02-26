import { PartialType } from '@nestjs/mapped-types';
import { CreateServientregaDto } from './create-servientrega.dto';

export class UpdateServientregaDto extends PartialType(CreateServientregaDto) {}
