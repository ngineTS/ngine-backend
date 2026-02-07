import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateUserEventDto {

    @IsNotEmpty()
    @IsUUID()
    sessionId: string;

    @IsNotEmpty()
    @IsString()
    url: string;
}
