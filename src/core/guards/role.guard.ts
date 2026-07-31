import { Injectable, CanActivate, ExecutionContext, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Feature, NavigationTypeNameArray, Permission } from '../decorators/role.decorator';
import { DataSource } from 'typeorm';

/**
 * The idea, here, is to link a navigation to the action applied by the user.
 * The navigation can then be compared to user navigation permissions to allow or not the action.
 * 
 * This role requires the following parameters:
 * - The feature (ex: Calendar. It has to match entity name.)
 * - The permission (or action): view, add, edit or delete
 * - The navigation or navigation id (if possible)
 * - The navigation type name
 * 
 * Ways to identify navigation:
 * - navigation id is used as request parameter
 * - entity id is used as request parameter -> fetch navigation id from table
 * - navigation is used as request body
 * - no parameter, no body or no navigation found -> Valid action based on navigation type
 */
@Injectable()
export class RolesGuard implements CanActivate {
  
  constructor(
    private _reflector: Reflector,
    private _datasource: DataSource
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this._reflector.get(Permission, context.getHandler());
    if (!permission) {
      return true;
    }
    
    const entity = this._reflector.get(Feature, context.getClass());
    const navigationTypeNameArray = this._reflector.get(NavigationTypeNameArray, context.getClass());
    const request = context.switchToHttp().getRequest();
    const body = request.body;
    const params = request.params;
    const user = request.user;

    switch (permission) {

      case "view":
        /* if we look for a specific navigation id */
        if (params.navigationId) {
          if (user.userNavigationPermissions?.find(obj => obj.navigationGroupId === params.navigationId)) {
            return true;
          }
          else {
            return false;
          }
        }
        /* if we look for a specific id then find navigation id associated */
        if (params.id && entity) {
          const data = await this.findNavigationInTableById(entity, params.id);
          if (!data) {
            throw new NotFoundException(`Id ${params.id} not found.`);
          }
          if (data.navigationId) {
            if (user.userNavigationPermissions.find(obj => obj.navigationGroupId === data.navigationId)) {
              return true;
            }
            else {
              return false;
            }
          }
        }
        /* if table not aggregated by navigationId then check for navigation type only */
        if (user.userNavigationPermissions.find(obj => navigationTypeNameArray.includes(obj.navigationTypeName))) {
          return true;
        }
        else {
          return false;
        }

      case 'edit':
        /* if we look for a specific id then find navigation id associated. */
        if (params.id && entity) {
          const data = await this.findNavigationInTableById(entity, params.id);   
          if (!data) {
            throw new NotFoundException(`Id ${params.id} not found.`);
          }
          if (data.navigationId) {
            if (
              user.userNavigationPermissions
                .find(obj => obj.navigationGroupId === data.navigationId)
                ?.permissionName?.includes('edit')
            ) {
              return true;
            }
            else {
              return false;
            }
          }
        }
        /* if table not aggregated by navigationId then check for navigationType only */
        if (
          user.userNavigationPermissions
            .find(obj => navigationTypeNameArray.includes(obj.navigationTypeName))?.permissionName
            ?.includes('edit')
        ) {
          return true;
        }
        else {
          return false;
        }

      case 'add':
        /* if we pass a body then look for navigation id inside body props. */
        if (body?.navigationId) {
          if (
            user.userNavigationPermissions
              .find(obj => obj.navigationGroupId === body.navigationId)?.permissionName
              ?.includes('add')
          ) {
            return true;
          }
          else {
            return false;
          }
        }

      case 'delete':
        /* if we look for a specific id then find navigation id associated. */
        if (params.id && entity) {
          const data = await this.findNavigationInTableById(entity, params.id);
          if (!data) {
            throw new NotFoundException(`Id ${params.id} not found.`);
          }
          if (data.navigationId) {
            if (
              user.userNavigationPermissions
                ?.find(obj => obj.navigationGroupId === data.navigationId)?.permissionName
                ?.includes('delete')
            ) {
              return true;
            }
            else {
              return false;
            }
          }
        }
        /* if we pass a body then look for navigation id inside body props. */
        if (body?.navigationId) {
          if (
            user.userNavigationPermissions
              .find(obj => obj.navigationGroupId === body.navigationId)?.permissionName
              ?.includes('delete')
          ) {
            return true;
          }
          else {
            return false;
          }
        }
        /* if table not aggregated by navigationId then check for navigationType only */
        if (
          user.userNavigationPermissions
            .find(obj =>  navigationTypeNameArray.includes(obj.navigationTypeName))?.permissionName
            ?.includes('delete')
        ) {
          return true;
        }
        else {
          return false;
        }
    }

    return false;
  }

  /**
   * Find record in repository for given entity and id.
   * 
   * @param entityClassName The TypeORM entity class name.
   * @param id The id.
   * @returns The record.
   */
  async findNavigationInTableById(entityClassName: string, id: string) {
    const repo = this._datasource.getRepository(entityClassName);
    return repo.findOneBy({ id });
  }
}