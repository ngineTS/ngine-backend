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
  
}