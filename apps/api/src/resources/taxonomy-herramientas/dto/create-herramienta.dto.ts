import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { HerramientaStatus } from '../entities/herramienta.entity';

export class CreateHerramientaDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(HerramientaStatus)
  status?: HerramientaStatus;

  @IsOptional()
  @IsUUID()
  suggestedBy?: string;
}
