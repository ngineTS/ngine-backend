import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleNavigationPermissionDto } from './create-role-navigation-permission.dto';

export class UpdateRoleNavigationPermissionDto extends PartialType(CreateRoleNavigationPermissionDto) {}
