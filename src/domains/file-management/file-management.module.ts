import { Module } from '@nestjs/common';
import { FileManagementService } from './file-management.service';
import { FileManagementController } from './file-management.controller';
import { MediaService } from '../media/media.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from '../media/entities/media.entity';
import { FileUploadValidatorService } from './file-upload-validator';

@Module({
  imports:[TypeOrmModule.forFeature([Media])],
  controllers: [FileManagementController],
  providers: [
    FileManagementService,
    MediaService,
    FileUploadValidatorService
  ],
})
export class FileManagementModule {}
