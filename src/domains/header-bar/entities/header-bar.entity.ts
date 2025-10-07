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
    gap: string;

    @Column()
    fontFamily: string;

    @Column()
    fontSize: string;

    @Column()
    color: string;

    @Column()
    activeColor: string;

    @Column()
    isVertical: boolean;

    @Column()
    isVisibleDuringNavigation: boolean;
}
