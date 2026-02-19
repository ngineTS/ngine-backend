import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, Matches } from "class-validator";

export class CreateTableVizDto {
    @IsNotEmpty()
    @IsUUID()
    navigationId: string;

    @IsOptional()
    @IsString()
    tableName?: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^[A-Za-z ]+$/, {
      message: 'Module name must contain only letters.',
    })
    tableLabel: string;

    @IsNotEmpty()
    @IsBoolean()
    isEditable: boolean;
}
