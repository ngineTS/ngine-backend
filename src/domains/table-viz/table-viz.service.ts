import { Injectable } from '@nestjs/common';
import { CreateTableVizDto } from './dto/create-table-viz.dto';
import { UpdateTableVizDto } from './dto/update-table-viz.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableViz } from './entities/table-viz.entity';

@Injectable()
export class TableVizService {

    constructor(@InjectRepository(TableViz)
                private tableVizRepository: Repository<TableViz>) {}

  create(createTableVizDto: CreateTableVizDto) {
    return 'This action adds a new tableViz';
  }

  findAll() {
    return `This action returns all tableViz`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tableViz`;
  }

  findByNavigationId(navigationId) {

  }

  update(id: number, updateTableVizDto: UpdateTableVizDto) {
    return `This action updates a #${id} tableViz`;
  }

  remove(id: number) {
    return `This action removes a #${id} tableViz`;
  }
}
