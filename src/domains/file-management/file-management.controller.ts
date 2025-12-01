import { Controller, Get, Post, Param, Delete, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { FileManagementService } from './file-management.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('file-management')
export class FileManagementController {
  constructor(private readonly fileManagementService: FileManagementService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.fileManagementService.uploadFile(file);
  }
 
  @Get(':fileName')
  getFile(@Param('fileName') fileName: string) {
    return this.fileManagementService.getFile(fileName);
  }

  @Delete(':fileName')
  deleteFile(@Param('fileName') fileName: string) {
    return this.fileManagementService.deleteFile(fileName);
  }
}
