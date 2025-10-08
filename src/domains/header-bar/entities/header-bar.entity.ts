import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class HeaderBar {

    @PrimaryGeneratedColumn()
    id: string;
    
    @Column()
    navigationId: string;

    @Column()
    backgroundColor: string;

    @Column()
    imageName: string;

    @Column()
    borderBottom: string;

    @Column()
    gap: number;

    @Column()
    fontFamily: string;

    @Column()
    fontSize: number;

    @Column()
    color: string;

    @Column()
    activeColor: string;

    @Column()
    height: number;

    @Column()
    isVertical: boolean;

    @Column()
    isVisibleDuringNavigation: boolean;
}
