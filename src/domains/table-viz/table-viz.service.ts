import { Injectable } from '@nestjs/common';
import { CreateTableVizDto } from './dto/create-table-viz.dto';
import { UpdateTableVizDto } from './dto/update-table-viz.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TableViz } from './entities/table-viz.entity';
import { stringToLowerCaseWithUnderscore } from 'src/core/utils/string-transfo-util';

@Injectable()
export class TableVizService {

  constructor(@InjectRepository(TableViz)
              private _tableVizRepository: Repository<TableViz>,
              private _dataSource: DataSource) {}

  async create(createTableVizDto: CreateTableVizDto) {
    createTableVizDto.tableName = stringToLowerCaseWithUnderscore(createTableVizDto.tableLabel);
    return await this._tableVizRepository.save(createTableVizDto);
  }

  async findByNavigationId(navigationId) {
    return await this._tableVizRepository.findOne({
      where: {
        navigationId: navigationId
      },
      relations: ['customFormInputs']
    })
  }

  async update(id: string, updateTableVizDto: UpdateTableVizDto) {
    return await this._tableVizRepository.update(id, updateTableVizDto);
  }

  async findTableNames(schema: string = 'my_app') {
    const result = await this._dataSource.query(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = $1 
       ORDER BY table_name;`,
      [schema],
    );
    return result.map((row: { table_name: string }) => row.table_name);
  }

  async findTableContentByTableName(tableName: string) {
    return await this._dataSource.createQueryBuilder()
      .select('*')
      .from(`my_app.${tableName}`, 't')
      .execute();
  }

}
