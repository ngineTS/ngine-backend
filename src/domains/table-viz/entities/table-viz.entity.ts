import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TableViz {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    navigationId: string;

    @Column()
    tableName: string;

    @Column()
    tableLabel: string;

    @Column()
    isEditable: boolean;
}
