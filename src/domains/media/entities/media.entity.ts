import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Media {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    displayLabel: string;

    @Column()
    type: string;

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
