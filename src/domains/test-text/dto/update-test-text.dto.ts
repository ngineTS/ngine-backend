import { PartialType } from '@nestjs/mapped-types';
import { CreateTestTextDto } from './create-test-text.dto';

export class UpdateTestTextDto extends PartialType(CreateTestTextDto) {}
