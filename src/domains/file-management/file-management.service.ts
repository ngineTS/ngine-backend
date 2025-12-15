import { Injectable } from '@nestjs/common';
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

  async uploadFile(file) {
    const { originalname } = file;
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
      createdBy: '00000000-0000-0000-0000-000000000000',
      createdDate: new Date(),
      updatedBy: '00000000-0000-0000-0000-000000000000',
      updatedDate: new Date()
    }
    return await this.mediaService.create(media);
  }

  async s3_upload(file, bucket, name, mimetype) {
    const fileName: string = path.parse(name).name + uuidv4() + path.parse(name).ext
    const params = {
      Bucket: bucket,
      Key: fileName,
      Body: file,
      ContentType: mimetype
      //ACL: 'public-read',
      //ContentDisposition: 'inline',
      //CreateBucketConfiguration: {
      //  LocationConstraint: 'ap-south-1',
      //},
    };
    return await this.s3.upload(params).promise();
  }

  getFile(fileName: string){
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Expires: 3600,
    };
    const url = this.s3.getSignedUrl('getObject', params);
    return JSON.stringify(url);
  }

  async deleteFile(fileName: string){
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileName,
    }
    await this.s3.deleteObject(params).promise();
    await this.mediaService.softDelete(fileName);
    return JSON.stringify('deleted');
  }

}
