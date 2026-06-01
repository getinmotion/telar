import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateStoryDto } from './create-story.dto';

export class UpdateStoryDto extends PartialType(OmitType(CreateStoryDto, ['artisanId'] as const)) {}
