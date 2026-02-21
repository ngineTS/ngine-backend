import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { IsNull, Repository } from 'typeorm';
import { UserRole } from '../user-role/entities/user-role.entity';
import { RoleNavigationPermission } from '../role-navigation-permission/entities/role-navigation-permission.entity';

@Injectable()
export class RoleService {

  constructor(
    @InjectRepository(Role)
    private _roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private _userRoleRepository: Repository<UserRole>,
    @InjectRepository(RoleNavigationPermission)
    private _roleNavigationPermissionRepository: Repository<RoleNavigationPermission>,
  ) {}

  /**
   * Find all roles without relations, ordered alphabeatically.
   */
  async findAllRoles() {
    return await this._roleRepository.find({
      where: { deletedDate: IsNull() },
      order: { displayLabel: 'ASC' }
    })
  }

  /**
   * Get all roles with roleNavigationPermissions relations ordered by updated date.
   * 
   * @returns The roles.
   */
  async findAllRolesWithNavigationPermissions() {
    const roles = await this._roleRepository.find({
      relations: [
        'roleNavigationPermissions',
        'roleNavigationPermissions.navigation',
        'roleNavigationPermissions.permission'
      ],
      where: { deletedDate: IsNull() },
      order: { updatedDate: 'DESC' }
    });
    
    roles.forEach(role => {
      role.roleNavigationPermissions = role.roleNavigationPermissions.filter(obj => !obj.deletedDate);
    })

    return roles;
  }

  /**
   * Save Role.
   * 
   * @param createRoleDto The role payload.
   * @param userId The user id from request.
   * @returns The role saved.
   * @description
   * 1. Transform displayLabel into name.
   * 2. Add audit data then save role.
   */
  async create(createRoleDto: CreateRoleDto, userId: string) {
    /* 1. */
    createRoleDto["name"] = createRoleDto["displayLabel"]?.toLowerCase()?.replace(/ /g, "-");
    
    /* 2. */
    createRoleDto["createdDate"] = new Date();
    createRoleDto["createdBy"] = userId;
    createRoleDto["updatedDate"] = new Date();
    createRoleDto["updatedBy"] = userId;
    return this._roleRepository.save(createRoleDto);
  }

  /**
   * Update role.
   * 
   * @param id The role id.
   * @param updateRoleDto The role payload.
   * @returns The update response object.
   * @description
   * 1. Transform displayLabel to name.
   * 2. Add audit data then update role.
   */
  async update(id: string, updateRoleDto: UpdateRoleDto, userId: string) {
    /* 1. */
    if (updateRoleDto['displayLabel']) {
      updateRoleDto["name"] = updateRoleDto["displayLabel"]?.toLowerCase()?.replace(/ /g, "-");
    }

    /* 2. */
    updateRoleDto["updatedDate"] = new Date();
    updateRoleDto["updatedBy"] = userId;
    return this._roleRepository.update(id, updateRoleDto);
  }

  /**
   * Remove role and his relations.
   * 
   * @param id The role id.
   * @description
   * 1. Add audit data then soft delete role.
   * 2. Soft delete related use roles.
   * 3. Soft delete related role navigation permissions.
   */
  async remove(id: string, userId: string) {
    let removedTotal = 0;
    /* 1. */
    const updateRoleResponse = await this._roleRepository.update(id, {
      deletedDate: new Date(),
      deletedBy: userId
    });

    /* 2. */
    let userRolesToRemove = await this._userRoleRepository.find({
      where: { roleId: id }
    });
    for(let userRole of userRolesToRemove) {
      userRole["deletedDate"] = new Date();
      userRole["deletedBy"] = userId;
    }
    removedTotal = removedTotal 
      + (await this._userRoleRepository.save(userRolesToRemove)).length;

    /* 3. */
    let roleNavigationPermissionsToRemove = await this._roleNavigationPermissionRepository.find({
      where: { roleId: id }
    });
    for(let roleNavigationPermission of roleNavigationPermissionsToRemove) {
      roleNavigationPermission["deletedDate"] = new Date();
      roleNavigationPermission["deletedBy"] = userId;
    }
    removedTotal = removedTotal 
      + (await this._roleNavigationPermissionRepository.save(roleNavigationPermissionsToRemove)).length;    

    return removedTotal + updateRoleResponse.affected!;
  }

}
