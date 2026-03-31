import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateCareTagDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  iconUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
