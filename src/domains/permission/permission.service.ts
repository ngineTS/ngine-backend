import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { IsNull, Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PermissionService {

  constructor(@InjectRepository(Permission)
              private _permissionRepository: Repository<Permission>) { }

  async findAll() {
    return await this._permissionRepository.find({
      where: {deletedDate: IsNull()}
    });
  }

}
