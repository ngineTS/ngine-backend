import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Feature, Permission } from '../decorators/role.decorator';
import { DataSource, EntityTarget, ObjectLiteral } from 'typeorm';

/**
 * This role requires:
 * * the feature information (ex: Calendar. It has to match entity name)
 * * the permission information (view, add, edit, delete)
 * * the navigation or navigation id to validate the userNavigationPermissions against
 */
@Injectable()
export class RolesGuard implements CanActivate {
  
  constructor(private _reflector: Reflector,
              private _datasource: DataSource
             ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this._reflector.get(Permission, context.getHandler());
    if (!permission) {
      return true;
    }
    
    const entity = this._reflector.get(Feature, context.getClass());
    const request = context.switchToHttp().getRequest();
    const body = request.body;
    const params = request.params;
    const user = request.user;

    switch (permission) {

      case "view":
        /* if we look for a specific navigation id */
        if (params.navigationId) {
          if (user.userNavigationPermissions?.find(obj => obj.navigationId === params.navigationId)) {
            return true;
          }
          else {
            return false;
          }
        }
        /* if we look for a specific id then find navigation id associated */
        if (params.id) {
          const data = await this.findNavigationInTableById(entity, params.id);
          if (!data) {
            throw new NotFoundException(`Id ${params.id} not found.`);
          }
          if (user.userNavigationPermissions?.find(obj => obj.navigationId === data.navigationId)) {
            return true;
          }
          else {
            return false;
          }
          
        }

      case 'edit':
        /* if we look for a specific id then find navigation id associated. */
        if (params.id) {
          const data = await this.findNavigationInTableById(entity, params.id);   
          if (!data) {
            throw new NotFoundException(`Id ${params.id} not found.`);
          }
          if (
            user.userNavigationPermissions
              ?.find(obj => obj.navigationId === data.navigationId)?.permissionName
              ?.includes('edit')
          ) {
            return true;
          }
          else {
            return false;
          }
          
        }

      case 'add':
        /* if we pass a body then look for navigation id inside body props. */
        if (body?.navigationId) {
          if (
            user.userNavigationPermissions
              ?.find(obj => obj.navigationId === body.navigationId)?.permissionName
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
        if (params.id) {
          const data = await this.findNavigationInTableById(entity, params.id);
          if (!data) {
            throw new NotFoundException(`Id ${params.id} not found.`);
          }
          if (
            user.userNavigationPermissions
              ?.find(obj => obj.navigationId === data.navigationId)?.permissionName
              ?.includes('delete')
          ) {
            return true;
          }
          else {
            return false;
          }
        }
        /* if we pass a body then look for navigation id inside body props. */
        if (body?.navigationId) {
          if (
            user.userNavigationPermissions
              ?.find(obj => obj.navigationId === body.navigationId)?.permissionName
              ?.includes('delete')
          ) {
            return true;
          }
          else {
            return false;
          }
        }
    }

    return false;
  }

  /**
   * Find record in repository by given id and entity.
   * @param entity The entity class name.
   * @param id The id.
   * @returns The record.
   */
  async findNavigationInTableById(entity: string, id: string) {
    const repo = this._datasource.getRepository(entity);
    return repo.findOneBy({ id });
  }
}