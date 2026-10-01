import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Banner {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    navigationId: string;

    @Column()
    description: string;

    @Column()
    backgroundColor: string;

    @Column()
    textColor: string;

    @Column()
    startDate: Date;

    @Column()
    endDate: Date;

    @Column()
    url: string;
}
