import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserRole {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    userId: string;

    @Column()
    roleId: string;

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