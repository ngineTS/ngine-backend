import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateRoleNavigationPermissionDto {

    @IsNotEmpty()
    @IsUUID()
    roleId: string;

    @IsNotEmpty()
    @IsUUID()
    navigationGroupId: string;

    @IsNotEmpty()
    @IsUUID()
    permissionId: string;
}
