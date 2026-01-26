import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class CreateNavigationDto {

    @IsNotEmpty()
    @IsUUID()
    parentId: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    displayLabel: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsNumber()
    order: number;

    @IsOptional()
    @IsBoolean()
    isDisabled?: boolean;

    @IsNotEmpty()
    @IsUUID()
    navigationTypeId: string;

    @IsOptional()
    @IsString()
    icon?: string;

    @IsOptional()
    @IsString()
    url?: string;
}
