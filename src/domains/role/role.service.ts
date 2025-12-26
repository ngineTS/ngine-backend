import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
  async create(createRoleDto: CreateRoleDto, userId: string) {
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
   * Find all roles without retlations, ordered alphabeatically.
   */
  async findAllRoles() {
    return await this._roleRepository.find({
      where: { deletedDate: IsNull() },
      order: { displayLabel: 'ASC' }
    })
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
  async update(id: string, updateRoleDto: UpdateRoleDto, userId: string) {
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
  async remove(id: string, userId: string) {
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
