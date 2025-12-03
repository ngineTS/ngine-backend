import { PartialType } from '@nestjs/mapped-types';
import { CreateUserEventDto } from './create-user-event.dto';

export class UpdateUserEventDto extends PartialType(CreateUserEventDto) {}
