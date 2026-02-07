import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateUserRoleDto {

    @IsNotEmpty()
    @IsUUID()
    userId: string;

    @IsNotEmpty()
    @IsUUID()
    roleId: string;
}
