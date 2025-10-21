import { Role } from "src/domains/role/entities/role.entity";
import { UserRole } from "src/domains/user-role/entities/user-role.entity";
import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  lastName: string;

  @Column()
  emailAddress: string;

  @Column()
  password: string;

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

  @OneToMany(() => UserRole, userRole => userRole.userId)
  @JoinColumn({name: 'id', referencedColumnName: 'userId'})
  userRoles: UserRole[];

}