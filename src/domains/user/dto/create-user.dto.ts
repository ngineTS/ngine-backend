import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateUserDto {

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsNotEmpty()
    @IsString()
    emailAddress: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}
