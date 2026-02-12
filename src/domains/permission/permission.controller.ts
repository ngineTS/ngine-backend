import { Controller, Get, UseGuards } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { NavigationTypeNameArray, Permission } from 'src/core/decorators/role.decorator';
import { RolesGuard } from 'src/core/guards/role.guard';

@NavigationTypeNameArray(['role-management'])
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Permission('view')
  @UseGuards(RolesGuard)
  @Get()
  findAll() {
    return this.permissionService.findAll();
  }

}
