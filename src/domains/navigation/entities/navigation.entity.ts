import { HeaderBar } from "src/domains/header-bar/entities/header-bar.entity";
import { NavigationType } from "src/domains/navigation-type/entities/navigation-type.entity";
import { TestText } from "src/domains/test-text/entities/test-text.entity";
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
    color: string;

    @Column()
    width: number;

    @Column()
    height: number;

    @Column()
    isDisabled: boolean;

    @Column()
    navigationTypeId: string;

    @Column()
    icon: string;

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

    @OneToOne(() => NavigationType, navigationType => navigationType)
    @JoinColumn({ name: 'navigationTypeId', referencedColumnName: 'id' })
    navigationType: NavigationType;

    @OneToMany(() => Navigation, navigation => navigation.parent)
    @JoinColumn({name: 'id', referencedColumnName: 'parentId'})
    children: Navigation[];

    @ManyToOne(() => Navigation, navigation => navigation.children)
    @JoinColumn({name: 'parentId', referencedColumnName: 'id' })
    parent: Navigation;

    @OneToOne(() => TestText, testText => testText)
    @JoinColumn({name: 'id', referencedColumnName: 'navigationId'})
    testText: TestText;

    @OneToOne(() => HeaderBar, headerBar => headerBar)
    @JoinColumn({ name: 'id', referencedColumnName: 'navigationId' })
    headerBar: HeaderBar;
}
