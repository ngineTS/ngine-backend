import { PartialType } from '@nestjs/mapped-types';
import { CreateAppSettingDto } from './create-app-setting.dto';

export class UpdateAppSettingDto extends PartialType(CreateAppSettingDto) {}
