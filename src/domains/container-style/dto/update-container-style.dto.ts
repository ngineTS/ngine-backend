import { PartialType } from '@nestjs/mapped-types';
import { CreateContainerStyleDto } from './create-container-style.dto';

export class UpdateContainerStyleDto extends PartialType(CreateContainerStyleDto) {}
