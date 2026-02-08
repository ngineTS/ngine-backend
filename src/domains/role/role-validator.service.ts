import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Role } from "./entities/role.entity";
import { IsNull, Repository } from "typeorm";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { CreateRoleDto } from "./dto/create-role.dto";


@Injectable()
export class RoleValidatorService {
  
  constructor(
    @InjectRepository(Role)
    private _roleRepository: Repository<Role>
  ) { }

  /**
   * Valid delete action.
   * 
   * @param roleId The id of the role to delete.
   * @throws {NotFoundException} If role to delete is not found.
   * @throws {BadRequestException} If role to delete is either super admin or guest.
   */
  async validDeleteAction(roleId: string) {
    const role = await this._roleRepository.findOne({
      where: { 
        id: roleId,
        deletedDate: IsNull()
      }
    })
    
    if (!role) {
      throw new NotFoundException(`Role '${roleId}' not found.`);
    }

    if (role.name === 'super-admin' || role.name === 'guest') {
      throw new BadRequestException(`'Super Admin' and 'Guest' roles cannot be deleted.`);
    }
  }

  /**
   * Valid update action.
   * 
   * @param roleDto The role dto to valid.
   * @param roleId The role id.
   * @throws {NotFoundException} If role is not found.
   * @throws {BadRequestException} If role is super admin.
   */
  async validUpdateAction(roleDto: UpdateRoleDto, roleId: string) {
    const role = await this._roleRepository.findOne({
      where: { 
        id: roleId,
        deletedDate: IsNull()
      }
    })
    
    if (!role) {
      throw new NotFoundException(`Role '${roleId}' not found.`);
    }

    if (role.name === 'super-admin') {
      throw new BadRequestException(`'Super Admin' role cannot be edited.`);
    }

    if (roleDto.displayLabel) {
      await this.validRoleDisplayLabelUniqueness(roleDto.displayLabel, roleId);
    }
  }

  /**
   * Valid insert action.
   * 
   * @param roleDto The role dto to valid.
   */
  async validInsertAction(roleDto: CreateRoleDto) {
      await this.validRoleDisplayLabelUniqueness(roleDto.displayLabel);
  }

  /**
   * Check if role with same displayLabel already exists.
   * 
   * @param displayLabel The role displayLabel property.
   * @param roleId The role id (optional).
   * @throws {BadRequestException} If another role already exists with same displayLabel.
   */
  async validRoleDisplayLabelUniqueness(displayLabel: string, roleId?: string) {
    const roleWithSameNameExists = await this._roleRepository.findOne({
        where: { 
          displayLabel,
          deletedDate: IsNull()
        }
      })

      if (roleWithSameNameExists && roleWithSameNameExists.id !== roleId) {
        throw new BadRequestException(`Role '${displayLabel}' already exists.`);
      }
  }

}