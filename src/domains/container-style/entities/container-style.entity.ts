import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ContainerStyle {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    refId: string;

    @Column()
    backgroundColor: string;

    @Column()
    borderColor: string;
    
    @Column()
    borderStyle: string;

    @Column()
    borderWidth: number;

    @Column()
    borderTopLeftRadius: number;

    @Column()
    borderTopRightRadius: number;

    @Column()
    borderBottomLeftRadius: number;

    @Column()
    borderBottomRightRadius: number;

    @Column()
    isBorderTopHidden: boolean;

    @Column()
    isBorderRightHidden: boolean;

    @Column()
    isBorderBottomHidden: boolean;

    @Column()
    isBorderLeftHidden: boolean;

    @Column()
    backgroundImage: string;

    @Column()
    isBackgroundTransparent: boolean;
}