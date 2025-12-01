import { Injectable } from '@nestjs/common';
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

  async findAll() {
    return await this.mediaRepository.find({
      where: {
        deletedDate: IsNull()
      },
      order: {
        createdDate: 'DESC'
      }
    });
  }

  async softDelete(fileName: string) {
    return await this.mediaRepository.update(
      { name: fileName }, 
      { 
        deletedBy: '00000000-0000-0000-0000-000000000000',
        deletedDate: new Date(),
      }
    );
  }
}
