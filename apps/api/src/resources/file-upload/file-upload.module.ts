import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { S3Module } from '../../common/services/s3/s3.module';

@Module({
  imports: [ConfigModule, S3Module],
  controllers: [FileUploadController],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
