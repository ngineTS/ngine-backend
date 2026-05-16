import { PartialType } from '@nestjs/mapped-types';
import { CreateNavigationTypeDto } from './create-navigation-type.dto';

export class UpdateNavigationTypeDto extends PartialType(CreateNavigationTypeDto) {}
