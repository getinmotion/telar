import { IsString, IsOptional } from 'class-validator';

export class CreateCuratorialCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
