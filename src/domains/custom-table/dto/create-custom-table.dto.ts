import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateCustomTableDto {

    @IsNotEmpty()
    @IsUUID()
    navigationId: string;

    [key: string]: any;
}
