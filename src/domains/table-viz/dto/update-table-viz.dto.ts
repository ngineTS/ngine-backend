import { PartialType } from '@nestjs/mapped-types';
import { CreateTableVizDto } from './create-table-viz.dto';

export class UpdateTableVizDto extends PartialType(CreateTableVizDto) {}
