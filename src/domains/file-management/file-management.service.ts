import { BadRequestException, Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import path = require('path');
import { MediaService } from '../media/media.service';
import { CreateMediaDto } from '../media/dto/create-media.dto';
import * as fs from 'fs';
import * as mime from 'mime-types';
import { Response } from 'express';


@Injectable()
export class FileManagementService {

  constructor(private mediaService: MediaService) { }
  
  private readonly uploadDir = './uploads';

  onModuleInit() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }
  
  /**
   * Upload file and save media record with file key.
   * 
   * @param file The file to upload.
   * @param userId The userId from the request token (used for audit).
   * @returns The file information saved.
   * @throws {BadRequestException} If operation failed.
   */
  async uploadFile(file, userId: string) {
    const { originalname } = file;

    try {
      const fileName =
        path.parse(originalname).name +
        uuidv4() +
        path.parse(originalname).ext;

      const filePath = path.join(this.uploadDir, fileName);
      fs.writeFileSync(filePath, file.buffer);

      const media: CreateMediaDto = {
        name: fileName,
        displayName: originalname,
        type: file.mimetype,
        createdBy: userId,
        createdDate: new Date(),
        updatedBy: userId,
        updatedDate: new Date()
      }

      return await this.mediaService.create(media);
    } 
    catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * Get file stream.
   * 
   * @param fileName The file name
   * @param res The express response.
   * @returns The file stream.
   */
  getFile(fileName: string, res: Response) {
    const filePath = path.join(this.uploadDir, fileName);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`File not found: ${fileName}`);
    }

    const mimeType = mime.lookup(fileName) || 'application/octet-stream';
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `inline; filename="${fileName}"`,
    });

    const stream = fs.createReadStream(filePath);
    return new StreamableFile(stream);
  }

  /**
   * Delete file and soft delete media record.
   * 
   * @param fileName The file key.
   * @param userId The user id from request token (used for audit).
   * @returns 'deleted'
   * @throws {BadRequestException} If operation failed.
   */
  async deleteFile(fileName: string, userId){
    try {
      const filePath = path.join(this.uploadDir, fileName);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await this.mediaService.softDelete(fileName, userId);
      return JSON.stringify('deleted');
    } 
    catch(error) {
      throw new BadRequestException(error);
    }
  }

}
