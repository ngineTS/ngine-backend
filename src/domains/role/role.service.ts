import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { IsNull, Repository } from 'typeorm';
import { UserRole } from '../user-role/entities/user-role.entity';
import { RoleNavigationPermission } from '../role-navigation-permission/entities/role-navigation-permission.entity';

@Injectable()
export class RoleService {

  constructor(@InjectRepository(Role)
              private _roleRepository: Repository<Role>,
              @InjectRepository(UserRole)
              private _userRoleRepository: Repository<UserRole>,
              @InjectRepository(RoleNavigationPermission)
              private _roleNavigationPermissionRepository: Repository<RoleNavigationPermission>) {}

  /**
   * Save Role.
   * Assign name prop from displayLabel.
   * @param createRoleDto The role payload.
   * @returns The role saved.
   */
  async create(createRoleDto: CreateRoleDto) {
    createRoleDto["name"] = createRoleDto["displayLabel"]?.toLowerCase()?.replace(/ /g, "-");
    createRoleDto["createdDate"] = new Date();
    createRoleDto["createdBy"] = '00000000-0000-0000-0000-000000000000';
    createRoleDto["updatedDate"] = new Date();
    createRoleDto["updatedBy"] = '00000000-0000-0000-0000-000000000000';
    return await this._roleRepository.save(createRoleDto);
  }

  /**
   * Get all roles with roleNavigationPermissions relations ordered by updated date.
   * @returns The roles.
   */
  async findAllRolesWithNavigationPermissions() {
    return await this._roleRepository.find({
      relations: [
        'roleNavigationPermissions',
        'roleNavigationPermissions.navigation',
        'roleNavigationPermissions.permission'
      ],
      where: { 
        deletedDate: IsNull(),
        roleNavigationPermissions: {
          deletedDate: IsNull(),
        }
      },
      order: {
        updatedDate: 'DESC'
      }
    });
  }

  /**
   * Update role.
   * @param id The role id.
   * @param updateRoleDto The role payload.
   * @returns The update response object.
   */
  async update(id: string, updateRoleDto: UpdateRoleDto) {
    updateRoleDto["updatedDate"] = new Date();
    updateRoleDto["updatedBy"] = '00000000-0000-0000-0000-000000000000';
    return await this._roleRepository.update(id, updateRoleDto);
  }

  /**
   * Remove role and his relations.
   * @param id The role id to remove.
   */
  async remove(id: string) {
    let removedTotal = 0;
    const updateRoleResponse = await this._roleRepository.update(id, {
      deletedDate: new Date(),
      deletedBy: '00000000-0000-0000-0000-000000000000'
    });
    
    if (updateRoleResponse && updateRoleResponse.affected === 0) {
      throw new NotFoundException();
    }

    let userRolesToRemove = await this._userRoleRepository.find({
      where: { roleId: id }
    });
    for(let userRole of userRolesToRemove) {
      userRole["deletedDate"] = new Date();
      userRole["deletedBy"] = '00000000-0000-0000-0000-000000000000';
    }
    removedTotal = removedTotal 
      + (await this._userRoleRepository.save(userRolesToRemove)).length;

    let roleNavigationPermissionsToDelete = await this._roleNavigationPermissionRepository.find({
      where: { roleId: id }
    });
    for(let roleNavigationPermission of roleNavigationPermissionsToDelete) {
      roleNavigationPermission["deletedDate"] = new Date();
      roleNavigationPermission["deletedBy"] = '00000000-0000-0000-0000-000000000000';
    }
    removedTotal = removedTotal 
      + (await this._userRoleRepository.save(roleNavigationPermissionsToDelete)).length;    

    return removedTotal + updateRoleResponse.affected!;
  }
}
