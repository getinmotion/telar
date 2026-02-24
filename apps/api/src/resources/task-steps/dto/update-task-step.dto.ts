import { PartialType } from '@nestjs/swagger';
import { CreateTaskStepDto } from './create-task-step.dto';

export class UpdateTaskStepDto extends PartialType(CreateTaskStepDto) {}
