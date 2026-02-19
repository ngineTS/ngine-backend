import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, ValidateIf } from "class-validator";
import { ColumnType } from "typeorm";
import { SimpleColumnType, SpatialColumnType, WithLengthColumnType, WithPrecisionColumnType, WithWidthColumnType } from "typeorm/driver/types/ColumnTypes";


export class CreateCustomFormInputDto {
    id: string;

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
    @Matches(/^[A-Za-z ]+$/, {
        message: 'Input label name must contain only letters.',
    })
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
