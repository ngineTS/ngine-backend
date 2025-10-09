import { Injectable } from '@nestjs/common';
import { CreateHeaderBarDto } from './dto/create-header-bar.dto';
import { UpdateHeaderBarDto } from './dto/update-header-bar.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { HeaderBar } from './entities/header-bar.entity';
import { IsNull, Repository } from 'typeorm';
import { Navigation } from '../navigation/entities/navigation.entity';

@Injectable()
export class HeaderBarService {

  constructor(@InjectRepository(HeaderBar)
              private headerBarRepository: Repository<HeaderBar>,
              @InjectRepository(Navigation)
              private navigationRepository: Repository<Navigation>) {}

  async create(createHeaderBarDto: CreateHeaderBarDto) {
    return await this.headerBarRepository.save(createHeaderBarDto);
  }

  async findMainHeaderBar() {
    return await this.headerBarRepository.findOne({
      where: { 
        navigationId: IsNull(),
        deletedBy: IsNull(),
      }
    });
  }

  findAll() {
    return `This action returns all headerBar`;
  }

  findOne(id: number) {
    return `This action returns a #${id} headerBar`;
  }

  async update(id: string, updateHeaderBarDto: UpdateHeaderBarDto) {
    return await this.headerBarRepository.update(id, updateHeaderBarDto);
  }

  async softDelete(id: string) {
    const headerBar = await this.headerBarRepository.findOne({
      where: { id: id }
    });
    let navigstionsToDelete = await this.navigationRepository.find({
      where: { parentId: headerBar?.navigationId }
    });
    for (let navigation of navigstionsToDelete) {
      navigation.deletedBy = '00000000-0000-0000-0000-000000000000';
      navigation.deletedDate = new Date();
    }
    await this.navigationRepository.save(navigstionsToDelete);
    //TODO: Soft Delete item instead. 
    // But before find a way to exclude soft deleted headerBarService in get nested navigation API.
    return await this.headerBarRepository.delete(id); 
  }
}
