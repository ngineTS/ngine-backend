import { Injectable } from '@nestjs/common';
import { CreateHeaderBarDto } from './dto/create-header-bar.dto';
import { UpdateHeaderBarDto } from './dto/update-header-bar.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { HeaderBar } from './entities/header-bar.entity';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class HeaderBarService {

  constructor(@InjectRepository(HeaderBar)
              private headerBarRepository: Repository<HeaderBar>) {}

  async create(createHeaderBarDto: CreateHeaderBarDto) {
    console.log('CREATE header bar', createHeaderBarDto);
    return await this.headerBarRepository.save(createHeaderBarDto);
  }

  async findMainHeaderBar() {
    return await this.headerBarRepository.findOne({
      where: { navigationId: IsNull() }
    });
  }

  findAll() {
    return `This action returns all headerBar`;
  }

  findOne(id: number) {
    return `This action returns a #${id} headerBar`;
  }

  async update(id: string, updateHeaderBarDto: UpdateHeaderBarDto) {
    console.log('UPDATE header bar', updateHeaderBarDto);
    return await this.headerBarRepository.update(id, updateHeaderBarDto);
  }

  remove(id: number) {
    return `This action removes a #${id} headerBar`;
  }
}
