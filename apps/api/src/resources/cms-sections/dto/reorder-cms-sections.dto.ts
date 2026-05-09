import { IsArray, IsString, MinLength } from 'class-validator';

export class ReorderCmsSectionsDto {
  @IsString()
  @MinLength(1)
  pageKey: string;

  @IsArray()
  @IsString({ each: true })
  orderedIds: string[];
}
