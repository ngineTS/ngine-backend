import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserEvent {
    
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    userId: string;

    @Column()
    sessionId: string;

    @Column()
    url: string;

    @Column()
    date: Date;
}





