import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TestText {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    message: string;

    @Column()
    navigationId: string

}