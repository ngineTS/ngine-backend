import { PartialType } from '@nestjs/mapped-types';
import { CreateTypographyStyleDto } from './create-typography-style.dto';

export class UpdateTypographyStyleDto extends PartialType(CreateTypographyStyleDto) {}
