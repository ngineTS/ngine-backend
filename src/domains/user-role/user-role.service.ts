import { Injectable } from '@nestjs/common';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from './entities/user-role.entity';
import { IsNull, Repository } from 'typeorm';
import { UserRoleValidatorService } from './user-role-validator.service';

@Injectable()
export class UserRoleService {

  constructor(
    @InjectRepository(UserRole)
    private _userRoleRepository: Repository<UserRole>,
    private _userRoleValidatorService: UserRoleValidatorService
  ) {}

  /**
   * Bulk save user roles for given user.
   * For each user role:
   * - if it is not part of the payload but found in db then delete it
   * - if it is part of the payload and not found in db then insert it
   * 
   * @param userId The id of the user.
   * @param createUserRoleDtoArray The array of user roles payload.
   * @param createdBy The user id from the request token (used for audit).
   * @return The user roles saved.
   * @description
   * 1. Valid user role payload.
   * 2. Identify and store user roles to save and those to delete.
   * 3. Add audit data and delete user roles.
   * 4. Add audit data and save user roles.
   */
  async bulkSaveUserRoles(
    userId: string,
    createUserRoleDtoArray: Array<CreateUserRoleDto>,
    createdBy: string
  ) {
    /* 1. */
    await this._userRoleValidatorService.validUserRole(userId);

    /* 2. */
    const userRoleIdsToDelete: string[] = [];
    const userRolesPayloadToSave: Array<CreateUserRoleDto> = [];    
    /* get db user roles. */
    const dbUserRoles = await this._userRoleRepository.find({
      where: {
        userId: userId,
        deletedDate: IsNull()
      }
    });
    /* store user role ids removed by user */
    for (const dbUserRole of dbUserRoles) {
      if (!createUserRoleDtoArray.find(userRole => dbUserRole.roleId === userRole['roleId'])) {
        userRoleIdsToDelete.push(dbUserRole.id);
      }
    }
    /* store user role payloads added by user */
    for (const userRole of createUserRoleDtoArray) {
      if (!dbUserRoles.find(dbUserRole => userRole['roleId'] === dbUserRole.roleId)) {
        userRolesPayloadToSave.push(userRole);
      }
    }
    
    /* 3. */
    const recordsToDelete: any[] = [];
    userRoleIdsToDelete.forEach(id => 
      recordsToDelete.push({
        id: id,
        deletedBy: createdBy,
        deletedDate: new Date()
      })
    )
    await this._userRoleRepository.save(recordsToDelete);

    /* 4. */
    for (let element of userRolesPayloadToSave) {
      element["createdDate"] = new Date();
      element["createdBy"] = createdBy;
      element["updatedDate"] = new Date();
      element["updatedBy"] = createdBy;
    }
    return this._userRoleRepository.save(userRolesPayloadToSave);
  }
}
