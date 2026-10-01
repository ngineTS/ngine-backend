import { Injectable } from '@nestjs/common';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Banner } from './entities/banner.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BannerService {

  constructor(
    @InjectRepository(Banner)
    private _bannerRepository: Repository<Banner>
  ) {}

  create(createBannerDto: CreateBannerDto) {
    return this._bannerRepository.save(createBannerDto);
  }

  findAll() {
    return this._bannerRepository.find({
      order: { startDate: 'DESC' }
    });
  }

  findOneByNavigationId(navigationId: string) {
    return this._bannerRepository.findOne({ where: { navigationId } });
  }

  update(id: string, updateBannerDto: UpdateBannerDto) {
    return this._bannerRepository.update(id, updateBannerDto);
  }

  remove(id: string) {
    return this._bannerRepository.delete(id);
  }
}
