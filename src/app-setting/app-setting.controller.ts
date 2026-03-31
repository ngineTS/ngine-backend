import { Controller, Get } from '@nestjs/common';
import { AppSettingService } from './app-setting.service';

@Controller('app-setting')
export class AppSettingController {
  constructor(private readonly appSettingService: AppSettingService) {}

  @Get()
  findAll() {
    return this.appSettingService.findAll();
  }
}
