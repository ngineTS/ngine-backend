import { RoleNavigationPermission } from "src/domains/role-navigation-permission/entities/role-navigation-permission.entity";
import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";

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

    @OneToMany(() => RoleNavigationPermission, roleNavigationPermission => roleNavigationPermission.roleId)
    @JoinColumn({name: 'id', referencedColumnName: 'roleId'})
    roleNavigationPermissions: RoleNavigationPermission[];
}
