import { PartialType } from '@nestjs/mapped-types';
import { CreateAgentTaskDto } from './create-agent-task.dto';
import { OmitType } from '@nestjs/swagger';

// Omitimos userId y agentId porque no se deben poder actualizar
export class UpdateAgentTaskDto extends PartialType(
  OmitType(CreateAgentTaskDto, ['userId', 'agentId'] as const),
) {}
