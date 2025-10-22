import { Role } from "src/domains/role/entities/role.entity";
import { User } from "src/domains/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

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

    @OneToOne(() => Role, role => role)
    @JoinColumn({name: 'roleId', referencedColumnName: 'id'})
    role: Role;

    @ManyToOne(() => User, user => user.userRoles)
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user: User;

}