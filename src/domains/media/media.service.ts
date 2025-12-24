import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Media } from './entities/media.entity';

@Injectable()
export class MediaService {

  constructor(@InjectRepository(Media)
              private mediaRepository: Repository<Media>) {}

  create(createMediaDto: CreateMediaDto) {
    return this.mediaRepository.save(createMediaDto);
  }

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

  async softDelete(fileName: string, userId: string) {
    const updateResult = await this.mediaRepository.update(
      { name: fileName }, 
      { 
        deletedBy: userId,
        deletedDate: new Date(),
      }
    );

    if (updateResult.affected === 0) {
      throw new NotFoundException(`file ${fileName} not found.`)
    }

    return updateResult;
  }
}
