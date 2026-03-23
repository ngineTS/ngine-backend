import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class QuillEditor {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    navigationId: string;
 
    @Column()
    content: string;

    @Column()
    fileName: string;

}