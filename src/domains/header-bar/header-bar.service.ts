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

  create(createHeaderBarDto: CreateHeaderBarDto) {
    return 'This action adds a new headerBar';
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

  update(id: number, updateHeaderBarDto: UpdateHeaderBarDto) {
    return `This action updates a #${id} headerBar`;
  }

  remove(id: number) {
    return `This action removes a #${id} headerBar`;
  }
}
