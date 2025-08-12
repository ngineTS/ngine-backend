import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class QuillEditor {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    content: string;

    @Column()
    navigationId: string

}