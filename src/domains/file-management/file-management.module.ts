import { Module } from '@nestjs/common';
import { FileManagementService } from './file-management.service';
import { FileManagementController } from './file-management.controller';
import { MediaService } from '../media/media.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from '../media/entities/media.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Media])],
  controllers: [FileManagementController],
  providers: [FileManagementService, MediaService],
})
export class FileManagementModule {}
