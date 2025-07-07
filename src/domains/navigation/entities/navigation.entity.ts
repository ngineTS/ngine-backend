import { IsNotEmpty, IsUUID } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Navigation {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    parentId: string;

    @Column()
    name: string;

    @Column()
    displayLabel: string;

    @Column()
    order: number;

}
