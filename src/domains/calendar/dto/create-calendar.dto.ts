import { IsBoolean, IsDate, IsDateString, isNotEmpty, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateCalendarDto {
    
    @IsNotEmpty()
    @IsUUID()
    navigationId: string;

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsDateString()
    startDate: Date;

    @IsNotEmpty()
    @IsDateString()
    endDate: Date;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    fileId?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    url?: string;

    @IsOptional()
    @IsBoolean()
    allDay?: boolean;
}
