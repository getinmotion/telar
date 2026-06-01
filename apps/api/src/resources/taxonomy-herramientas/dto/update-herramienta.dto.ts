import { PartialType } from '@nestjs/swagger';
import { CreateHerramientaDto } from './create-herramienta.dto';

export class UpdateHerramientaDto extends PartialType(CreateHerramientaDto) {}
