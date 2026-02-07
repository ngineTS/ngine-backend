import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Role } from "../role/entities/role.entity";
import { IsNull, Repository } from "typeorm";
import { CreateRoleNavigationPermissionDto } from "./dto/create-role-navigation-permission.dto";

@Injectable()
export class RoleNavigationPermissionValidator {

  constructor(
    @InjectRepository(Role)
    private _roleRepository: Repository<Role>
  ) { }

  /**
   * Valid roleNavigationPermissions payload.
   * 
   * @param rnpDtoArray The roleNavigationPermissions payload.
   * @throws {BadRequestException} If role is super admin.
   */
  async validRoleNavigationPermission(rnpDtoArray: Array<CreateRoleNavigationPermissionDto>) {
    const superAdminRole = await this._roleRepository.findOne({
      where: {
        name: 'super-admin',
        deletedDate: IsNull()
      }
    });

    for (const rnp of rnpDtoArray) {
      if (rnp.roleId === superAdminRole?.id) {
        throw new BadRequestException(`'Super Admin' role cannot be modified.`);
      }
    }
  }

}