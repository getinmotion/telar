import { IsString, IsOptional, IsBoolean, IsEnum, IsUUID, MaxLength } from 'class-validator';
import { StoryType } from '../entities/story-library.entity';

export class CreateStoryDto {
  @IsUUID()
  artisanId: string;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsEnum(StoryType)
  type?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
