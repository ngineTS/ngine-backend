import { PartialType } from '@nestjs/mapped-types';
import { CreateContainerLayoutDto } from './create-container-layout.dto';

export class UpdateContainerLayoutDto extends PartialType(CreateContainerLayoutDto) {}
