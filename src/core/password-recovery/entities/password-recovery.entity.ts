import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'password_recovery'})
export class PasswordRecovery {

    @PrimaryGeneratedColumn()
    id: string;

    @Column({ unique: true })
    emailAddress: string;

    @Column({ unique: true })
    token: string;

    @Column({ unique: true })
    createdDate: Date;
}
