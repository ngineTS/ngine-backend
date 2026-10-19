import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateBannerDto {

    @IsNotEmpty()
    @IsString()
    navigationId: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    backgroundColor: string;

    @IsNotEmpty()
    @IsString()
    textColor: string;

    @IsNotEmpty()
    @IsDateString()
    startDate: Date;

    @IsNotEmpty()
    @IsDateString()
    endDate: Date;

    @IsOptional()
    @IsString()
    url: string;
}
