import { ColumnType } from "typeorm";
import { SimpleColumnType, SpatialColumnType, WithLengthColumnType, WithPrecisionColumnType, WithWidthColumnType } from "typeorm/driver/types/ColumnTypes";

export class CreateCustomFormInputDto {
    tableId: string;
    columnName: string;
    columnType: WithPrecisionColumnType | WithLengthColumnType | WithWidthColumnType | SpatialColumnType | SimpleColumnType;
    inputType: string;
    inputLabel: string;
    bindValue: string;
    bindLabel: string;
    validators: Array<string>
}
