import { Injectable, CanActivate, ExecutionContext, BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * This guard is used to check if the user has the right permission to access custom table routes.
 * The permission is checked based on the navigation id associated to the record in the custom table.
 * The navigation id is retrieved based on the request parameters or body depending on the request method.
 */
@Injectable()
export class CustomTableRoleGuard implements CanActivate {
  
  constructor(private _datasource: DataSource) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    
    const request = context.switchToHttp().getRequest();
    const body = request.body;
    const params = request.params;
    const user = request.user;
    const method = request.method;

    switch (method) {

      case "GET":
        if (user.userNavigationPermissions?.find(obj => obj.navigationId === params.navigationId)) {
          return true;
        }
        return false;

      case 'POST':
        if (
          user.userNavigationPermissions
            .find(obj => obj.navigationId === body.navigationId)?.permissionName
            ?.includes('add')
        ) {
          return true;
        }
        return false;

      case 'PATCH':
        const navigationIdPatchCase = await this.findNavigationIdByTableNameAndId(params.tableName, params.id);
        if (
          user.userNavigationPermissions
            .find(obj => obj.navigationId === navigationIdPatchCase)?.permissionName
            ?.includes('edit')
        ) {
          return true;
        }
        return false;

      case 'DELETE':
        const navigationIdDeleteCase = await this.findNavigationIdByTableNameAndId(params.tableName, params.id);
        if (
          user.userNavigationPermissions
            .find(obj => obj.navigationId === navigationIdDeleteCase)?.permissionName
            ?.includes('delete')
        ) {
          return true;
        }
        return false;
    }

    return false;
  }

  /**
   * Find navigation id by table name and record id.
   * 
   * @param tableName The table name.
   * @param recordId The record id.
   * @returns The navigation id.
   * @throws {NotFoundException} If record with given id not found in table.
   */
  async findNavigationIdByTableNameAndId(
    tableName: string,
    recordId: string
  ): Promise<string> {
    const navigationIdAsArray = await this._datasource.createQueryBuilder()
      .select('"navigationId"')
      .from(`custom_table.${tableName}`, 't')
      .where("id = :id", { id: recordId })
      .take(1)
      .execute();

    if (navigationIdAsArray.length === 0) {
      throw new NotFoundException(`Record with id ${recordId} not found in table ${tableName}.`);
    }

    return navigationIdAsArray[0].navigationId;
  }
}