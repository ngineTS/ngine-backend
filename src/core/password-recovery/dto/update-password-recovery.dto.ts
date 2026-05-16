import { PartialType } from '@nestjs/mapped-types';
import { CreatePasswordRecoveryDto } from './create-password-recovery.dto';

export class UpdatePasswordRecoveryDto extends PartialType(CreatePasswordRecoveryDto) {}
