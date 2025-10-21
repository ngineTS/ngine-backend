import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Role {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    displayLabel: string;

    @Column()
    description: string;

    @Column()
    isDisabled: boolean;

    @Column()
    createdBy: string;

    @Column()
    createdDate: Date;

    @Column()
    updatedBy: string;

    @Column()
    updatedDate: Date;

    @Column()
    deletedBy: string;

    @Column()
    deletedDate: Date;

}
