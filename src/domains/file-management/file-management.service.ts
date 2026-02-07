import { BadRequestException, Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import path = require('path');
import { MediaService } from '../media/media.service';
import { CreateMediaDto } from '../media/dto/create-media.dto';

@Injectable()
export class FileManagementService {

  constructor(private mediaService: MediaService){}  

  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  /**
   * Upload file and save media record with file key.
   * @param file The file to upload.
   * @param userId The userId from the request token (used for audit).
   * @returns The file information saved.
   */
  async uploadFile(file, userId: string) {
    const { originalname } = file;

    try {
      const s3Response = await this.s3_upload(
        file.buffer,
        process.env.AWS_S3_BUCKET_NAME,
        originalname,
        file.mimetype,
      );

      const media: CreateMediaDto = {
        name: s3Response.Key,
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
   * Upload file to S3 bucket.
   * 
   * @param file The file to upload.
   * @param bucket The bucket name.
   * @param name The original file name.
   * @param mimetype The file mime type.
   * @returns Upload response from S3 API.
   */
  async s3_upload(file, bucket, name, mimetype) {
    const fileName: string = path.parse(name).name + uuidv4() + path.parse(name).ext
    const params = {
      Bucket: bucket,
      Key: fileName,
      Body: file,
      ContentType: mimetype
    }

    return await this.s3.upload(params).promise();
  }

  /**
   * Get S3 temporary file url (duration: 1 hour).
   * 
   * @param fileName The file key.
   * @returns The temporary file url.
   */
  getFile(fileName: string){
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileName,
        Expires: 3600,
      };
      const url = this.s3.getSignedUrl('getObject', params);

      return JSON.stringify(url);
    } 
    catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * Delete file from S3 bucket and soft delete media record.
   * @param fileName The file key.
   * @param userId The user id from request token (used for audit).
   * @returns 'deleted'
   */
  async deleteFile(fileName: string, userId){
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: fileName,
      }
  
      await this.s3.deleteObject(params).promise();
      await this.mediaService.softDelete(fileName, userId);
      return JSON.stringify('deleted');
    } 
    catch(error) {
      throw new BadRequestException(error);
    }
  }

}
