import { TableViz } from "src/domains/table-viz/entities/table-viz.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SimpleColumnType, SpatialColumnType, WithLengthColumnType, WithPrecisionColumnType, WithWidthColumnType } from "typeorm/driver/types/ColumnTypes";

@Entity()
export class CustomFormInput {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    tableId: string;

    @Column()
    columnName: string;

    @Column()
    columnType: WithPrecisionColumnType | WithLengthColumnType | WithWidthColumnType | SpatialColumnType | SimpleColumnType;

    @Column()
    inputType: string;

    @Column()
    inputLabel: string;

    @Column('text', { array: true })
    validators: Array<string>;

    @Column()
    isList: boolean;

    @Column()
    bindValue: string;

    @Column()
    bindLabel: string;

    @Column()
    dropdownItems: string;

    @Column()
    dropdownRouteName: string;

    @ManyToOne(() => TableViz, tableViz => tableViz.customFormInputs)
    @JoinColumn({name: 'tableId', referencedColumnName: 'id'})
    table: TableViz[];
    
}
