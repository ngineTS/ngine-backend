import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class AppSetting {
    
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    settingName: string;

    @Column()
    settingValue: string;
}