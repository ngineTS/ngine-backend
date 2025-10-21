import { Injectable } from '@nestjs/common';
import { CreateRoleNavigationPermissionDto } from './dto/create-role-navigation-permission.dto';
import { UpdateRoleNavigationPermissionDto } from './dto/update-role-navigation-permission.dto';

@Injectable()
export class RoleNavigationPermissionService {
  create(createRoleNavigationPermissionDto: CreateRoleNavigationPermissionDto) {
    return 'This action adds a new roleNavigationPermission';
  }

  findAll() {
    return `This action returns all roleNavigationPermission`;
  }

  findOne(id: number) {
    return `This action returns a #${id} roleNavigationPermission`;
  }

  update(id: number, updateRoleNavigationPermissionDto: UpdateRoleNavigationPermissionDto) {
    return `This action updates a #${id} roleNavigationPermission`;
  }

  remove(id: number) {
    return `This action removes a #${id} roleNavigationPermission`;
  }
}
