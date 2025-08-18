import { TableViz } from "src/domains/table-viz/entities/table-viz.entity";
import { Column, ColumnType, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CustomFormInput {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    tableId: string;

    @Column()
    columnName: string;

    @Column()
    columnType: string;

    @Column()
    inputType: string;

    @Column()
    inputLabel: string;

    @Column('text', { array: true })
    validators: Array<string>;

    @Column()
    bindValue: string;

    @Column()
    bindLabel: string;

    @ManyToOne(() => TableViz, tableViz => tableViz.customFormInputs)
    @JoinColumn({name: 'tableId', referencedColumnName: 'id'})
    table: TableViz[];
    
}
