import { PartialType } from '@nestjs/swagger';
import { CreateNotificationDto } from './create-notification.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationDto extends PartialType(
  CreateNotificationDto,
) {
  @ApiPropertyOptional({
    description: 'Marcar notificación como leída/no leída',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  read?: boolean;
}
