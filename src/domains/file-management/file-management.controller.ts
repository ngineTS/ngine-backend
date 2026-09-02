import { Controller, Get, Post, Param, Delete, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileManagementService } from './file-management.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserId } from 'src/core/decorators/user.decorator';
import { FileUploadValidatorService } from './file-upload-validator';
import { Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';


@Controller('file-management')
export class FileManagementController {
  constructor(
    private readonly fileManagementService: FileManagementService,
    private readonly fileUploadValidatorService: FileUploadValidatorService
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB max
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @UserId() userId: string
  ) {
    await this.fileUploadValidatorService.validFileType(file);
    return this.fileManagementService.uploadFile(file, userId);
  }
 
  @SkipThrottle({ short: true, medium: true, long: true })
  @Get(':fileName')
  getFile(
    @Param('fileName') fileName: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.fileManagementService.getFile(fileName, res);
  }

  @Delete(':fileName')
  deleteFile(
    @Param('fileName') fileName: string,
    @UserId() userId: string
  ) {
    return this.fileManagementService.deleteFile(fileName, userId);
  }
}
