import { Injectable } from '@nestjs/common';
import { CreateRoleNavigationPermissionDto } from './dto/create-role-navigation-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { RoleNavigationPermission } from './entities/role-navigation-permission.entity';
import { RoleNavigationPermissionValidator } from './role-navigation-permission-validator.service';

@Injectable()
export class RoleNavigationPermissionService {

  constructor(
    @InjectRepository(RoleNavigationPermission)
    private _roleNavigationPermissionRepository: Repository<RoleNavigationPermission>,
    private _roleNavigationPermissionValidatorService: RoleNavigationPermissionValidator
  ) { }


  /**
   * Save array of roleNavigationPermissions.
   * For each roleNavigationPermission:
   * - if it is not part of the payload but found in db then delete it
   * - if it is part of the payload and not found in db then insert it
   * 
   * 
   * @param createRoleNavigationPermissionDtoArray The roleNavigationPermissions to save;
   * @param userId The userId from request token (used for audit).
   * @returns The roleNavigationPermissions saved.
   * @description
   * 1. Valid roleNavigationPermissions.
   * 2. Identify and store roleNavigationPermissions to save and those to delete.
   * 3. Add audit data and delete records.
   * 4. Add audit data and save user records.
   */
  async saveRoleNavigationArray(
    createRoleNavigationPermissionDtoArray: Array<CreateRoleNavigationPermissionDto>,
    userId: string
  ) {
    /* 1. */
    this._roleNavigationPermissionValidatorService.validRoleNavigationPermission(
      createRoleNavigationPermissionDtoArray
    );

    /* 2. */
    const roleNavigationPermissionIdsToDelete: string[] = [];
    const roleNavigationPermissionsPayloadToSave: Array<CreateRoleNavigationPermissionDto> = [];    
    /* get db roleNavigationPermissions */
    const dbRoleNavigationPermissions = await this._roleNavigationPermissionRepository.find({
      where: {
        roleId: createRoleNavigationPermissionDtoArray[0]["roleId"],
        deletedDate: IsNull()
      }
    });
    /* store rnp ids removed by user */
    for (const dbRnp of dbRoleNavigationPermissions) {
      if (!createRoleNavigationPermissionDtoArray.find(rnp => 
        dbRnp.navigationId === rnp["navigationId"] && dbRnp.permissionId === rnp["permissionId"]
      )) {
        roleNavigationPermissionIdsToDelete.push(dbRnp.id);
      }
    }
    /* store rnp payloads added by user */
    for (const rnp of createRoleNavigationPermissionDtoArray) {
      if (!dbRoleNavigationPermissions.find(dbRnp => 
        rnp["navigationId"] === dbRnp.navigationId && rnp["permissionId"] === dbRnp.permissionId
      )) {
        roleNavigationPermissionsPayloadToSave.push(rnp);
      }
    }
    
    /* 3. */
    const recordsToDelete: any[] = [];
    roleNavigationPermissionIdsToDelete.forEach(id => 
      recordsToDelete.push({
        id: id,
        deletedBy: userId,
        deletedDate: new Date()
      })
    )
    await this._roleNavigationPermissionRepository.save(recordsToDelete);

    /* 4. */
    for (let element of roleNavigationPermissionsPayloadToSave) {
      element["createdDate"] = new Date();
      element["createdBy"] = userId;
      element["updatedDate"] = new Date();
      element["updatedBy"] = userId;
    }
    return this._roleNavigationPermissionRepository.save(roleNavigationPermissionsPayloadToSave);
  }
}
