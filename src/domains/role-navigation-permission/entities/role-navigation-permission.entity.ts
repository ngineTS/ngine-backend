import { Navigation } from "src/domains/navigation/entities/navigation.entity";
import { Permission } from "src/domains/permission/entities/permission.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

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

    @OneToOne(() => Permission, permission => permission.id)
    @JoinColumn({name: 'permissionId', referencedColumnName: 'id'})
    permission: Permission;

    @OneToOne(() => Navigation, navigation => navigation.id)
    @JoinColumn({name: 'navigationId', referencedColumnName: 'id'})
    navigation: Navigation;

}