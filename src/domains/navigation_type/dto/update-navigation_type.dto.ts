import { PartialType } from '@nestjs/mapped-types';
import { CreateNavigationTypeDto } from './create-navigation_type.dto';

export class UpdateNavigationTypeDto extends PartialType(CreateNavigationTypeDto) {}
