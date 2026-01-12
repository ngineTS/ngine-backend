import { Injectable } from '@nestjs/common';
import { CreateTypographyStyleDto } from './dto/create-typography-style.dto';
import { UpdateTypographyStyleDto } from './dto/update-typography-style.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TypographyStyle } from './entities/typography-style.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TypographyStyleService {

  constructor(
    @InjectRepository(TypographyStyle)
    private _containerStyleRepository: Repository<TypographyStyle>
  ) {}

  async create(createTypographyStyleDto: CreateTypographyStyleDto) {
    return await this._containerStyleRepository.save(createTypographyStyleDto);
  }

  findAll() {
    return `This action returns all typographyStyle`;
  }

  findOne(id: number) {
    return `This action returns a #${id} typographyStyle`;
  }

  update(id: number, updateTypographyStyleDto: UpdateTypographyStyleDto) {
    return `This action updates a #${id} typographyStyle`;
  }

  remove(id: number) {
    return `This action removes a #${id} typographyStyle`;
  }
}
