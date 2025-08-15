import { TableViz } from "src/domains/table-viz/entities/table-viz.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CustomFormInput {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    tableId: string;

    @Column()
    columnName: string;

    @Column()
    inputType: string;

    @Column()
    inputLabel: string;

    @Column('text', { array: true })
    validators: Array<string>;

    @ManyToOne(() => TableViz, tableViz => tableViz.customFormInputs)
    @JoinColumn({name: 'tableId', referencedColumnName: 'id'})
    table: TableViz[];
    
}
