import { IsString, IsUUID, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateStoreDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  story?: string;

  @IsUUID()
  @IsOptional()
  legacyId?: string;
}
