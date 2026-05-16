import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomTableDto } from './create-custom-table.dto';

export class UpdateCustomTableDto extends PartialType(CreateCustomTableDto) {}
