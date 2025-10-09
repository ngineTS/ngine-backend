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
    borderBottom: number;

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
    isVisibleDuringNavigation: boolean;

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
