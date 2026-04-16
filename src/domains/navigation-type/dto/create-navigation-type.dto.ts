import { IsNotEmpty, IsString } from "class-validator";

export class CreateNavigationTypeDto {

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    displayLabel: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    thumbnailImage: string;
}