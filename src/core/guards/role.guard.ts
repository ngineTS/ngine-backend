import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '../decorators/role.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/domains/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RolesGuard implements CanActivate {
  
  constructor(private _reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permission = this._reflector.get(Permission, context.getHandler());
    if (!permission) {
      return true;
    }
    console.log('PERMISSION', permission)
    const request = context.switchToHttp().getRequest();
    const body = request.body;
    const params = request.params;
    const user = request.user;
    console.log('USER', user);
    console.log('BODY', body);
    console.log('PARAM', params.navigationId);

    return true;
  }

}