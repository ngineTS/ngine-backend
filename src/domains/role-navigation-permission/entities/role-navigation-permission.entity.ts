import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class RoleNavigationPermission {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    roleId: string;

    @Column()
    navigationId: string;

    @Column()
    permissionId: string;

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