import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppSettingService } from './app-setting.service';
import { CreateAppSettingDto } from './dto/create-app-setting.dto';

@Controller('app-setting')
export class AppSettingController {
  constructor(private readonly appSettingService: AppSettingService) {}

  @Post()
  updateAppSetting(@Body() createAppSettingDto: CreateAppSettingDto) {
    return this.appSettingService.updateAppSetting(createAppSettingDto);
  }

  @Get()
  findAll() {
    return this.appSettingService.findAll();
  }
}
