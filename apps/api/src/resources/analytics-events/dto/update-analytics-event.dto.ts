import { PartialType } from '@nestjs/mapped-types';
import { CreateAnalyticsEventDto } from './create-analytics-event.dto';

export class UpdateAnalyticsEventDto extends PartialType(
  CreateAnalyticsEventDto,
) {}
