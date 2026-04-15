import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppSetting } from './entities/app-setting.entity';
import { Repository } from 'typeorm';
import { CreateAppSettingDto } from './dto/create-app-setting.dto';

@Injectable()
export class AppSettingService {

  constructor(
    @InjectRepository(AppSetting)
    private _appSettingRepository: Repository<AppSetting>
  ) {}
  
  /**
   * Find all app settings.
   * 
   * @returns The app settings.
   */
  findAll() {
    return this._appSettingRepository.find();
  }


  /**
   *  Update app setting.
   * 
   * @param createAppSettingDto The app setting name and value.
   */
  updateAppSetting(createAppSettingDto: CreateAppSettingDto) {
    return this._appSettingRepository.update(
      { settingName: createAppSettingDto.settingName },
      { settingValue: createAppSettingDto.settingValue }
    );
  }

}
