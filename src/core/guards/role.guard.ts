import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Feature, Permission } from '../decorators/role.decorator';
import { DataSource } from 'typeorm';

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
    
    const feature = this._reflector.get(Feature, context.getClass());
    const request = context.switchToHttp().getRequest();
    const body = request.body;
    const params = request.params;
    const user = request.user;

    switch (permission) {

      case "view":
        //if we look for a specific navigation id
        if (params.navigationId) {
          if (user.userNavigationPermissions?.find(obj => obj.navigationId === params.navigationId)) {
            return true;
          }
        }
        //if we look for a specific id then find navigation id associated
        if (params.id) {
          const data = await this._datasource.createQueryBuilder()
            .select('*')
            .from(`my_app.${feature}`, 't')
            .where("id = :id", { id: params.id })
            .execute();
          if (!data || data.length === 0) {
            throw new NotFoundException(`Id ${params.id} not found.`);
          }
          if (data[0]?.navigationId) {
            if (user.userNavigationPermissions?.find(obj => obj.navigationId === data[0].navigationId)) {
              return true;
            }
          }
        }

      case 'edit':
        if (params.id) {
          const data = await this._datasource.createQueryBuilder()
            .select('*')
            .from(`my_app.${feature}`, 't')
            .where("id = :id", { id: params.id })
            .execute();
          if (!data || data.length === 0) {
            throw new NotFoundException(`Id ${params.id} not found.`);
          }
          if (data[0].navigationId) {
            if (
              user.userNavigationPermissions
                ?.find(obj => obj.navigationId === data[0].navigationId)?.permissionName
                ?.includes('edit')
            ) {
              return true;
            }
          }
        }

      case 'add':
        if (body?.navigationId) {
          if (
            user.userNavigationPermissions
              ?.find(obj => obj.navigationId === body.navigationId)?.permissionName
              ?.includes('add')
          ) {
            return true;
          }
        }

      case 'delete':
        if (params.id) {
          const data = await this._datasource.createQueryBuilder()
            .select('*')
            .from(`my_app.${feature}`, 't')
            .where("id = :id", { id: params.id })
            .execute();
          if (!data || data.length === 0) {
            throw new NotFoundException(`Id ${params.id} not found.`);
          }
          if (data[0]?.navigationId) {
            if (
              user.userNavigationPermissions
                ?.find(obj => obj.navigationId === data[0].navigationId)?.permissionName
                ?.includes('delete')
            ) {
              return true;
            }
          }
        }
        else if (body?.navigationId) {
          if (
            user.userNavigationPermissions
              ?.find(obj => obj.navigationId === body.navigationId)?.permissionName
              ?.includes('delete')
          ) {
            return true;
          }
        }    

    }

    throw new ForbiddenException();
  }

}