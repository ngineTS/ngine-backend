import { CustomFormInput } from "src/domains/custom-form-input/entities/custom-form-input.entity";
import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";

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

    @OneToMany(() => CustomFormInput, customForm => customForm.table)
    @JoinColumn({name: 'id', referencedColumnName: 'tableId'})
    customFormInputs: CustomFormInput[];

}
