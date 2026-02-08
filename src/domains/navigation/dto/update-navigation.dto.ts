import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, ValidateIf } from 'class-validator';

export class UpdateNavigationDto {

    @ValidateIf(obj => obj.displayLabel || obj.navigationTypeId)
    @IsNotEmpty()
    @IsUUID()
    parentId?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    displayLabel?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    order?: number;

    @IsOptional()
    @IsBoolean()
    isDisabled?: boolean;

    @ValidateIf(obj => obj.parentId)
    @IsNotEmpty()
    @IsUUID()
    navigationTypeId?: string;

    @IsOptional()
    @IsString()
    icon?: string;

    @IsOptional()
    @IsString()
    url?: string;

    @IsOptional()
    @IsBoolean()
    showIconOnly?: boolean;
}
