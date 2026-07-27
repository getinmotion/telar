import { PartialType } from '@nestjs/mapped-types';
import { CreatePassportUserDto } from './create-passport-user.dto';

export class UpdatePassportUserDto extends PartialType(
  CreatePassportUserDto,
) {}
