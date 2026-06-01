import { IsOptional, IsString, IsEmail, IsUUID } from 'class-validator';

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

  @IsOptional()
  @IsUUID()
  idTypeId?: string;

  @IsOptional()
  @IsString()
  idNumber?: string;

  @IsOptional()
  @IsUUID()
  countryId?: string;

  @IsOptional()
  @IsUUID()
  agreementId?: string;
}
