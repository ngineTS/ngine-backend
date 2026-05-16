import { BadRequestException, Injectable } from "@nestjs/common";
import { fileTypeFromBuffer } from "file-type";
import * as NodeClam from 'clamscan';

@Injectable()
export class FileUploadValidatorService {

  constructor() { }

  forbiddenExtensions = ['exe', 'sh', 'bat', 'js', 'php', 'py'];

  /**
   * Insure file type is not forbidden.
   * 
   * @param file The file.
   * @throws {BadRequestException} If file type is not found or forbidden.
   */
  async validFileType(file: Express.Multer.File) {
    const fileType = await fileTypeFromBuffer(file.buffer);

    if (!fileType) {
      throw new BadRequestException('Impossible to identify file type.');
    }

    this.forbiddenExtensions.forEach(extension => {
      if (fileType.ext.includes(extension) || fileType.mime.includes(extension)) {
        throw new BadRequestException(`.${extension} files or not allowed.`);
      }
    });
  }

  /**
   * Scan file via ClamScan to prevent malicious file upload.
   * 
   * @param file The file.
   * @throws {BadRequestException} If file is infected.
   */
  async scanFile(file: Express.Multer.File) {
    const clamscan = await new NodeClam().init();
    const { isInfected } = await clamscan.scanBuffer(file.buffer);
    console.log('INFECT', isInfected);

    if (isInfected) {
      throw new BadRequestException('File is infected');
    }
  }

}