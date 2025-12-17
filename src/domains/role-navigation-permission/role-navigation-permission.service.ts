import { Injectable } from '@nestjs/common';
import { CreateRoleNavigationPermissionDto } from './dto/create-role-navigation-permission.dto';
import { UpdateRoleNavigationPermissionDto } from './dto/update-role-navigation-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { RoleNavigationPermission } from './entities/role-navigation-permission.entity';

@Injectable()
export class RoleNavigationPermissionService {

  constructor(@InjectRepository(RoleNavigationPermission)
              private _roleNavigationPermissionRepository: Repository<RoleNavigationPermission>) { }

  async saveRoleNavigationArray(
    createRoleNavigationPermissionDtoArray: Array<CreateRoleNavigationPermissionDto>,
    userId: string
  ) {
    /* define array of rnp ids to delete */
    const roleNavigationPermissionIdsToDelete: string[] = [];
    /* define array of rnp payloads to save */
    const roleNavigationPermissionsPayloadToSave: Array<CreateRoleNavigationPermissionDto> = [];    
    /* get existing role navigation permissions by roleId */
    const existingRoleNavigationPermissions = await this._roleNavigationPermissionRepository.find({
      where: {
        roleId: createRoleNavigationPermissionDtoArray[0]["roleId"],
        deletedDate: IsNull()
      }
    });
    /* store rnp ids removed by user */
    for (const dbRnp of existingRoleNavigationPermissions) {
      if (!createRoleNavigationPermissionDtoArray.find(rnp => 
        dbRnp.navigationId === rnp["navigationId"] && dbRnp.permissionId === rnp["permissionId"]
      )) {
        roleNavigationPermissionIdsToDelete.push(dbRnp.id);
      }
    }
    /* store rnp payloads added by user */
    for (const rnp of createRoleNavigationPermissionDtoArray) {
      if (!existingRoleNavigationPermissions.find(dbRnp => 
        rnp["navigationId"] === dbRnp.navigationId && rnp["permissionId"] === dbRnp.permissionId
      )) {
        roleNavigationPermissionsPayloadToSave.push(rnp);
      }
    }
    /* add metadata to records to save */
    for (let element of roleNavigationPermissionsPayloadToSave) {
      element["createdDate"] = new Date();
      element["createdBy"] = userId;
      element["updatedDate"] = new Date();
      element["updatedBy"] = userId;
    }
    /* create array of records to delete based on ids retrieved above */
    const recordsToDelete: Array<UpdateRoleNavigationPermissionDto> = [];
    roleNavigationPermissionIdsToDelete.forEach(id => 
      recordsToDelete.push({
        id: id,
        deletedBy: userId,
        deletedDate: new Date()
      })
    )
    /* soft delete records */
    await this._roleNavigationPermissionRepository.save(recordsToDelete);
    /* save records and return result */
    return await this._roleNavigationPermissionRepository.save(roleNavigationPermissionsPayloadToSave);
  }


  async bulkRemove(ids: string[], userId: string) {
    const recordsToDelete: Array<UpdateRoleNavigationPermissionDto> = [];
    ids.forEach(id => 
      recordsToDelete.push({
        id: id,
        deletedBy: userId,
        deletedDate: new Date()
      })
    )
    return await this._roleNavigationPermissionRepository.save(recordsToDelete);
  }
}
