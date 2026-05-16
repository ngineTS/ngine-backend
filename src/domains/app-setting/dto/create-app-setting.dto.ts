import { IsNotEmpty, IsString } from "class-validator";

export class CreateAppSettingDto {
    @IsNotEmpty()
    @IsString()
    settingName: string;

    @IsNotEmpty()
    @IsString()
    settingValue: string;
}
