import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { StyleStatus } from '../entities/style.entity';

export class CreateStyleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(StyleStatus)
  status?: StyleStatus;

  @IsOptional()
  @IsUUID()
  suggestedBy?: string;
}
