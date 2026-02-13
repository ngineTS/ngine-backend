import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateTableVizDto {
    @IsNotEmpty()
    @IsUUID()
    navigationId: string;

    @IsOptional()
    @IsString()
    tableName?: string;

    @IsNotEmpty()
    @IsString()
    tableLabel: string;

    @IsNotEmpty()
    @IsBoolean()
    isEditable: boolean;
}
