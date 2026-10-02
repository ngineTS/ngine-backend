import { Navigation } from "src/domains/navigation/entities/navigation.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Banner {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    navigationId: string;

    @Column()
    description: string;

    @Column()
    backgroundColor: string;

    @Column()
    textColor: string;

    @Column()
    startDate: Date;

    @Column()
    endDate: Date;

    @Column()
    url: string;

    @OneToOne(() => Navigation, navigation => navigation)
    @JoinColumn({ name: 'navigationId', referencedColumnName: 'id'})
    navigation: Navigation;
}
