import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomFormInputDto } from './create-custom-form-input.dto';

export class UpdateCustomFormInputDto extends PartialType(CreateCustomFormInputDto) {}
