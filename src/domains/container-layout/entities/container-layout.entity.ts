import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ContainerLayout {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    refId: string;

    @Column({
        type: 'numeric',
        precision: 5,
        scale: 2
    })
	width: number;

    @Column({
        type: 'numeric',
        precision: 5,
        scale: 2
    })
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

    @Column({
        type: 'numeric',
        precision: 5,
        scale: 2
    })
    @Column()
	xPos: number;

    @Column({
        type: 'numeric',
        precision: 5,
        scale: 2
    })
    @Column()
	yPos: number;

    @Column()
	zIndex: number;
}
