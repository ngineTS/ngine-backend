import { Controller, Get, Post, Param, Delete, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { FileManagementService } from './file-management.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserId } from 'src/core/decorators/user.decorator';

@Controller('file-management')
export class FileManagementController {
  constructor(private readonly fileManagementService: FileManagementService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @UserId() userId: string
  ) {
    return await this.fileManagementService.uploadFile(file, userId);
  }
 
  @Get(':fileName')
  getFile(@Param('fileName') fileName: string) {
    return this.fileManagementService.getFile(fileName);
  }

  @Delete(':fileName')
  deleteFile(
    @Param('fileName') fileName: string,
    @UserId() userId: string
  ) {
    return this.fileManagementService.deleteFile(fileName, userId);
  }
}
