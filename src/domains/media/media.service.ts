import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Media } from './entities/media.entity';

@Injectable()
export class MediaService {

  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>
  ) { }

  /**
   * Create media.
   * 
   * @param createMediaDto The media dto.
   * @returns A promise of the media saved.
   */
  create(createMediaDto: CreateMediaDto) {
    return this.mediaRepository.save(createMediaDto);
  }

  /**
   * Get all medias.
   * 
   * @param orderBy The field we want to order.
   * @param order The order direction (ASC | DESC).
   * @returns An array of medias.
   */
  async findAll(orderBy: string, order: string) {
    return await this.mediaRepository.find({
      where: {
        deletedDate: IsNull()
      },
      order: {
        [orderBy]: order
      }
    });
  }

  /**
   * Soft delete media.
   * 
   * @param fileName The file name.
   * @param userId The userId (used for audit)
   * @returns A delete response
   * @throws {NotFoundException} if no media with file name is found.
   */
  async softDelete(fileName: string, userId: string) {
    const updateResult = await this.mediaRepository.update(
      { name: fileName }, 
      { 
        deletedBy: userId,
        deletedDate: new Date(),
      }
    );

    if (updateResult.affected === 0) {
      throw new NotFoundException(`file ${fileName} not found.`);
    }

    return updateResult;
  }

  /**
   * Find one media by given file name.
   * 
   * @param fileName The file name.
   * @returns The media.
   */
  async findMediaByFileName(fileName: string) {
    return this.mediaRepository.findOne({
      where: {
        name: fileName,
        deletedDate: IsNull()
      }
    });
  }

}
