import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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

}