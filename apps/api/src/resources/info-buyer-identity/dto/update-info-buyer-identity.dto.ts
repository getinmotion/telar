import { IsOptional, IsString, IsEmail } from 'class-validator';

export class UpdateInfoBuyerIdentityDto {
  @IsOptional()
  @IsString()
  nombreCompleto?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  celular?: string;
}
