import { Injectable } from '@nestjs/common';
import { CreateTableVizDto } from './dto/create-table-viz.dto';
import { UpdateTableVizDto } from './dto/update-table-viz.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableViz } from './entities/table-viz.entity';
import { stringToLowerCaseWithUnderscore } from 'src/core/utils/string-transfo-util';

@Injectable()
export class TableVizService {

  constructor(@InjectRepository(TableViz)
              private tableVizRepository: Repository<TableViz>) {}

  async create(createTableVizDto: CreateTableVizDto) {
    createTableVizDto.tableName = stringToLowerCaseWithUnderscore(createTableVizDto.tableLabel);
    return await this.tableVizRepository.save(createTableVizDto);
  }

  findAll() {
    return `This action returns all tableViz`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tableViz`;
  }

  async findByNavigationId(navigationId) {
    return await this.tableVizRepository.findOne({
      where: {
        navigationId: navigationId
      },
      relations: ['customFormInputs']
    })
  }

  async update(id: string, updateTableVizDto: UpdateTableVizDto) {
    return await this.tableVizRepository.update(id, updateTableVizDto);
  }

  remove(id: number) {
    return `This action removes a #${id} tableViz`;
  }
}
