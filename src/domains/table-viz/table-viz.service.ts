import { Injectable } from '@nestjs/common';
import { CreateTableVizDto } from './dto/create-table-viz.dto';
import { UpdateTableVizDto } from './dto/update-table-viz.dto';

@Injectable()
export class TableVizService {
  create(createTableVizDto: CreateTableVizDto) {
    return 'This action adds a new tableViz';
  }

  findAll() {
    return `This action returns all tableViz`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tableViz`;
  }

  update(id: number, updateTableVizDto: UpdateTableVizDto) {
    return `This action updates a #${id} tableViz`;
  }

  remove(id: number) {
    return `This action removes a #${id} tableViz`;
  }
}
