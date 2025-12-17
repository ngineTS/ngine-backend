import { Injectable } from '@nestjs/common';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from './entities/user-role.entity';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class UserRoleService {

  constructor(@InjectRepository(UserRole)
              private _userRoleRepository: Repository<UserRole>) {}

  async bulkSaveUserRoles(
    userId: string,
    createUserRoleDtoArray: Array<CreateUserRoleDto>,
    createdBy: string
  ) {
    /* define array of user role ids to delete */
        const userRoleIdsToDelete: string[] = [];
        /* define array of user role payloads to save */
        const userRolesPayloadToSave: Array<CreateUserRoleDto> = [];    
        /* get existing user roles by user id */
        const existingUserRoles = await this._userRoleRepository.find({
          where: {
            userId: userId,
            deletedDate: IsNull()
          }
        });
        /* store user role ids removed by user */
        for (const dbUserRole of existingUserRoles) {
          if (!createUserRoleDtoArray.find(userRole => dbUserRole.roleId === userRole['roleId'])) {
            userRoleIdsToDelete.push(dbUserRole.id);
          }
        }
        /* store user role payloads added by user */
        for (const userRole of createUserRoleDtoArray) {
          if (!existingUserRoles.find(dbUserRole => userRole['roleId'] === dbUserRole.roleId)) {
            userRolesPayloadToSave.push(userRole);
          }
        }
        /* add metadata to records to save */
        for (let element of userRolesPayloadToSave) {
          element["createdDate"] = new Date();
          element["createdBy"] = createdBy;
          element["updatedDate"] = new Date();
          element["updatedBy"] = createdBy;
        }
        /* create array of records to delete based on ids retrieved above */
        const recordsToDelete: Array<UpdateUserRoleDto> = [];
        userRoleIdsToDelete.forEach(id => 
          recordsToDelete.push({
            id: id,
            deletedBy: createdBy,
            deletedDate: new Date()
          })
        )
        /* soft delete records */
        await this._userRoleRepository.save(recordsToDelete);
        /* save records and return result */
        return await this._userRoleRepository.save(userRolesPayloadToSave);
  }
}
