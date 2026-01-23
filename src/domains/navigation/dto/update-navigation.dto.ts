import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID, MaxLength, ValidateIf } from 'class-validator';

export class UpdateNavigationDto {

    @IsOptional()
    @ValidateIf(obj => obj.displayLabel || obj.navigationTypeId)
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

    @IsOptional()
    @ValidateIf(obj => obj.parentId)
    @IsUUID()
    navigationTypeId?: string;

    @IsOptional()
    @IsString()
    icon?: string;
}
