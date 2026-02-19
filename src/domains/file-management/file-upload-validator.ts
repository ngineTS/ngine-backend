import { BadRequestException, Injectable } from "@nestjs/common";
import { fileTypeFromBuffer } from "file-type";

@Injectable()
export class FileUploadValidatorService {

  constructor() { }

  forbiddenExtensions = ['exe', 'sh', 'bat', 'js', 'php', 'py'];

  async validFileType(file: Express.Multer.File) {
    const fileType = await fileTypeFromBuffer(file.buffer);
    console.log(fileType);

    if (!fileType) {
      throw new BadRequestException('Impossible to identify file type.');
    }

    this.forbiddenExtensions.forEach(extension => {
      if (fileType.ext.includes(extension) || fileType.mime.includes(extension)) {
        throw new BadRequestException(`.${extension} files or not allowed.`);
      }
    });
        
  }
}