import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Calendar {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    navigationId: string;

    @Column()
    title: string;

    @Column()
    startDate: Date;

    @Column()
    endDate: Date;

    @Column()
    description: string;

    @Column()
    fileId: string;

    @Column()
    category: string;

    @Column()
    url: string;
}