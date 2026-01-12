import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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
   * If name already exists then throw BadRequest error.
   * @param createRoleDto The role payload.
   * @returns The role saved.
   */
  async create(
    createRoleDto: CreateRoleDto,
    userId: string,
    userRequest: {
      sub: string;
      userEmail: string;
      userNavigationPermissions: Array<{
        navigationId: string;
        permissionName: string;
      }>
    }
  ) {

    /* Valid permission (today requires all navigation add access). */
    if (
      !userRequest.userNavigationPermissions.find(obj => 
        obj.navigationId === '00000000-0000-0000-0000-000000000000' &&
        obj.permissionName.includes('add')
      )
    ) {
      throw new ForbiddenException();
    }
    createRoleDto["name"] = createRoleDto["displayLabel"]?.toLowerCase()?.replace(/ /g, "-");

    const roles = await this._roleRepository.find({
      where: { deletedDate: IsNull() }
    });
    
    if (roles?.find(role => role.name === createRoleDto['name'])) {
      throw new BadRequestException('This name already exists');
    }

    createRoleDto["createdDate"] = new Date();
    createRoleDto["createdBy"] = userId;
    createRoleDto["updatedDate"] = new Date();
    createRoleDto["updatedBy"] = userId;

    return await this._roleRepository.save(createRoleDto);
  }

  /**
   * Find all roles without relations, ordered alphabeatically.
   */
  async findAllRoles(
    userRequest: {
      sub: string;
      userEmail: string;
      userNavigationPermissions: Array<{
        navigationId: string;
        permissionName: string;
      }>
    }
  ) {
    if (
      !userRequest.userNavigationPermissions.find(obj => 
        obj.navigationId === '00000000-0000-0000-0000-000000000000' 
      )
    ) {
      throw new ForbiddenException();
    }
    
    return await this._roleRepository.find({
      where: { deletedDate: IsNull() },
      order: { displayLabel: 'ASC' }
    })
  }

  /**
   * Get all roles with roleNavigationPermissions relations ordered by updated date.
   * @returns The roles.
   */
  async findAllRolesWithNavigationPermissions(
    userRequest: {
      sub: string;
      userEmail: string;
      userNavigationPermissions: Array<{
        navigationId: string;
        permissionName: string;
      }>
    }
  ) {
    if (
      !userRequest.userNavigationPermissions.find(obj => 
        obj.navigationId === '00000000-0000-0000-0000-000000000000' 
      )
    ) {
      throw new ForbiddenException();
    }

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
   * Update role.
   * @param id The role id.
   * @param updateRoleDto The role payload.
   * @returns The update response object.
   */
  async update(
    id: string,
    updateRoleDto: UpdateRoleDto,
    userId: string,
    userRequest: {
      sub: string;
      userEmail: string;
      userNavigationPermissions: Array<{
        navigationId: string;
        permissionName: string;
      }>
    }
  ) {
    if (
      !userRequest.userNavigationPermissions.find(obj => 
        obj.navigationId === '00000000-0000-0000-0000-000000000000' &&
        obj.permissionName.includes('edit')
      )
    ) {
      throw new ForbiddenException();
    }

    if (updateRoleDto['displayLabel']) {
      updateRoleDto["name"] = updateRoleDto["displayLabel"]?.toLowerCase()?.replace(/ /g, "-");

      const roles = await this._roleRepository.find({
        where: { deletedDate: IsNull() }
      });
    
      if (roles?.find(role => role.name === updateRoleDto['name'] && role.id !== id)) {
        throw new BadRequestException('This name already exists');
      }
    }

    updateRoleDto["updatedDate"] = new Date();
    updateRoleDto["updatedBy"] = userId;

    const updateResult = await this._roleRepository.update(id, updateRoleDto);

    if (updateResult.affected === 0) {
      throw new NotFoundException(`Role id ${id} not found.`)
    }

    return updateResult;
  }

  /**
   * Remove role and his relations.
   * @param id The role id to remove.
   */
  async remove(
    id: string,
    userId: string,
    userRequest: {
      sub: string;
      userEmail: string;
      userNavigationPermissions: Array<{
        navigationId: string;
        permissionName: string;
      }>
    }
  ) {
    if (
      !userRequest.userNavigationPermissions.find(obj => 
        obj.navigationId === '00000000-0000-0000-0000-000000000000' &&
        obj.permissionName.includes('delete')
      )
    ) {
      throw new ForbiddenException();
    }

    let removedTotal = 0;
    const updateRoleResponse = await this._roleRepository.update(id, {
      deletedDate: new Date(),
      deletedBy: userId
    });
    
    if (updateRoleResponse.affected === 0) {
      throw new NotFoundException();
    }

    let userRolesToRemove = await this._userRoleRepository.find({
      where: { roleId: id }
    });
    for(let userRole of userRolesToRemove) {
      userRole["deletedDate"] = new Date();
      userRole["deletedBy"] = userId;
    }
    removedTotal = removedTotal 
      + (await this._userRoleRepository.save(userRolesToRemove)).length;

    let roleNavigationPermissionsToDelete = await this._roleNavigationPermissionRepository.find({
      where: { roleId: id }
    });
    for(let roleNavigationPermission of roleNavigationPermissionsToDelete) {
      roleNavigationPermission["deletedDate"] = new Date();
      roleNavigationPermission["deletedBy"] = userId;
    }
    removedTotal = removedTotal 
      + (await this._userRoleRepository.save(roleNavigationPermissionsToDelete)).length;    

    return removedTotal + updateRoleResponse.affected!;
  }

}
