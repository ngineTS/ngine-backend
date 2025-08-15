import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomFormDto } from './create-custom-form-input.dto';

export class UpdateCustomFormDto extends PartialType(CreateCustomFormDto) {}
