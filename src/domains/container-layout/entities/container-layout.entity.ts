import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ContainerLayout {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    refId: string;

    @Column()
	width: number;

    @Column()
	height: number;
    
    @Column()
	marginTop: number;

    @Column()
	marginRight: number;

    @Column()
	marginBottom: number;

    @Column()
	marginLeft: number;

    @Column()
	paddingTop: number;

    @Column()
	paddingRight: number;

    @Column()
	paddingBottom: number;

    @Column()
	paddingLeft: number;

    @Column()
	gap: number;

}
