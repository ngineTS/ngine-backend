import { Navigation } from "src/domains/navigation/entities/navigation.entity";
import { Permission } from "src/domains/permission/entities/permission.entity";
import { Role } from "src/domains/role/entities/role.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

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

    @OneToOne(() => Permission, permission => permission)
    @JoinColumn({name: 'permissionId', referencedColumnName: 'id'})
    permission: Permission;

    @OneToOne(() => Navigation, navigation => navigation)
    @JoinColumn({name: 'navigationId', referencedColumnName: 'id'})
    navigation: Navigation;

    @ManyToOne(() => Role, role => role.roleNavigationPermissions)
    @JoinColumn({ name: 'roleId', referencedColumnName: 'id' })
    role: Role;

}