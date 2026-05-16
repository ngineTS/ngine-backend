import { Module } from '@nestjs/common';
import { AppSettingService } from './app-setting.service';
import { AppSettingController } from './app-setting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppSetting } from './entities/app-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppSetting])],
  controllers: [AppSettingController],
  providers: [AppSettingService],
})
export class AppSettingModule {}
