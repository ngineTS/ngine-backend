import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TypographyStyle {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    refId: string;

    @Column()
    fontFamily: string;

    @Column()
    fontSize: number;

    @Column()
    fontWeight: number;

    @Column()
    color: string;

    @Column()
    activeColor: string;

}
