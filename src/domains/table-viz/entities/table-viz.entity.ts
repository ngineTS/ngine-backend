import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TableViz {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    navigationId: string;

    @Column()
    tableName: string;

}
