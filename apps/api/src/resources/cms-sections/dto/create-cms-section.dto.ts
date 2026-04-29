import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCmsSectionDto {
  @IsString()
  @MinLength(1)
  pageKey: string;

  @IsString()
  @MinLength(1)
  type: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number;

  @IsObject()
  payload: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  published?: boolean;
}
