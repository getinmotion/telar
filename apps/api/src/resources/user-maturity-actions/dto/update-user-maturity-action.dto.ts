import { PartialType } from '@nestjs/swagger';
import { CreateUserMaturityActionDto } from './create-user-maturity-action.dto';

export class UpdateUserMaturityActionDto extends PartialType(CreateUserMaturityActionDto) {}
