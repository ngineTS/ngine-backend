import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateRoleDto {

    @IsNotEmpty()
    @IsString()
    displayLabel: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsOptional()
    @IsBoolean()
    isDisabled?: boolean;
}
