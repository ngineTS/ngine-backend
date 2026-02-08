import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateIf } from "class-validator";
import { ColumnType } from "typeorm";
import { SimpleColumnType, SpatialColumnType, WithLengthColumnType, WithPrecisionColumnType, WithWidthColumnType } from "typeorm/driver/types/ColumnTypes";


export class CreateCustomFormInputDto {

    @IsNotEmpty()
    @IsUUID()
    tableId: string;

    @ValidateIf(obj => obj.inputType === 'dropdown')
    @IsNotEmpty()
    @IsString()
    columnType?: WithPrecisionColumnType | WithLengthColumnType | WithWidthColumnType | SpatialColumnType | SimpleColumnType;
    
    @IsOptional()
    @IsString()
    columnName?: string;

    @IsNotEmpty()
    @IsString()
    inputType: string;

    @IsNotEmpty()
    @IsString()
    inputLabel: string;

    @IsOptional()
    @IsBoolean()
    isList?: boolean;

    @IsOptional()
    @IsString()
    bindValue?: string;

    @IsOptional()
    @IsString()
    bindLabel?: string;

    @IsOptional()
    @IsArray()
    validators?: Array<string>;

    @IsOptional()
    @IsString()
    dropdownItems?: string;

    @IsOptional()
    @IsString()
    dropdownRouteName?: string;
}
