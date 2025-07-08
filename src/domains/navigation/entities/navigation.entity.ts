import { NavigationType } from "src/domains/navigation_type/entities/navigation_type.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Navigation {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    parentId: string;

    @Column()
    name: string;

    @Column()
    displayLabel: string;

    @Column()
    order: number;

    @Column()
    navigationTypeId: string;

    @OneToOne(() => NavigationType, navigationType => navigationType)
    @JoinColumn({ name: 'navigationTypeId', referencedColumnName: 'id' })
    navigationType: NavigationType;

    @OneToMany(() => Navigation, navigation => navigation.parent)
    @JoinColumn({name: 'id', referencedColumnName: 'parentId'})
    children: Navigation[];

    @ManyToOne(() => Navigation, navigation => navigation.children)
    @JoinColumn({name: 'parentId', referencedColumnName: 'id' })
    parent: Navigation;
}
