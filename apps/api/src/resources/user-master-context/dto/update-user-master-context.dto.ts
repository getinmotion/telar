import { PartialType } from '@nestjs/swagger';
import { CreateUserMasterContextDto } from './create-user-master-context.dto';

export class UpdateUserMasterContextDto extends PartialType(CreateUserMasterContextDto) {}
