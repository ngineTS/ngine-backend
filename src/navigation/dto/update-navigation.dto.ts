import { PartialType } from '@nestjs/mapped-types';
import { CreateNavigationDto } from './create-navigation.dto';

export class UpdateNavigationDto extends PartialType(CreateNavigationDto) {}
