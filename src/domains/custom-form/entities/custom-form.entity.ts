import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CustomForm {

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

    @Column()
    validators: Array<string>;
    
}
