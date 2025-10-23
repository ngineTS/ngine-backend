import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { IsNull, Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PermissionService {

  constructor(@InjectRepository(Permission)
              private _permissionRepository: Repository<Permission>) {

  }
  create(createPermissionDto: CreatePermissionDto) {
    return 'This action adds a new permission';
  }

  async findAll() {
    return await this._permissionRepository.find({
      where: {deletedDate: IsNull()}
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} permission`;
  }

  update(id: number, updatePermissionDto: UpdatePermissionDto) {
    return `This action updates a #${id} permission`;
  }

  remove(id: number) {
    return `This action removes a #${id} permission`;
  }
}
