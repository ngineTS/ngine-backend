import { Role } from "src/domains/role/entities/role.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

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

    @OneToOne(() => Role, role => role.id)
    @JoinColumn({name: 'roleId', referencedColumnName: 'id'})
    role: Role;

}