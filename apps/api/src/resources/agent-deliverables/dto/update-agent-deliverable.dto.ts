import { PartialType } from '@nestjs/swagger';
import { CreateAgentDeliverableDto } from './create-agent-deliverable.dto';

export class UpdateAgentDeliverableDto extends PartialType(CreateAgentDeliverableDto) {}
