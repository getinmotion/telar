import { PartialType } from '@nestjs/mapped-types';
import { CreateUsersPassportDto } from './create-users-passport.dto';

export class UpdateUsersPassportDto extends PartialType(
  CreateUsersPassportDto,
) {}
