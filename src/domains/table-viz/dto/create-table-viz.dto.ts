import { IsBoolean, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateTableVizDto {
    @IsNotEmpty()
    @IsUUID()
    navigationId: string;

    @IsNotEmpty()
    @IsString()
    tableName: string;

    @IsNotEmpty()
    @IsString()
    tableLabel: string;

    @IsNotEmpty()
    @IsBoolean()
    isEditable: boolean;
}
