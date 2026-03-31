import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppSetting } from './entities/app-setting.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AppSettingService {

  constructor(
    @InjectRepository(AppSetting)
    private _appSettingRepository: Repository<AppSetting>
  ) {}
  
  /**
   * Find all app settings.
   * 
   * @returns The app settings
   */
  findAll() {
    return this._appSettingRepository.find();
  }

}
