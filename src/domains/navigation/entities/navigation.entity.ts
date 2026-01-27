import { ContainerLayout } from "src/domains/container-layout/entities/container-layout.entity";
import { ContainerStyle } from "src/domains/container-style/entities/container-style.entity";
import { Menu } from "src/domains/menu/entities/menu.entity";
import { NavigationType } from "src/domains/navigation-type/entities/navigation-type.entity";
import { TypographyStyle } from "src/domains/typography-style/entities/typography-style.entity";
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
    description: string;

    @Column()
    order: number;

    @Column()
    isDisabled: boolean;

    @Column()
    navigationTypeId: string;

    @Column()
    icon: string;

    @Column()
    showIconOnly: boolean;

    @Column()
    url: string;

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

    @OneToOne(() => Menu, menu => menu)
    @JoinColumn({ name: 'id', referencedColumnName: 'navigationId' })
    menu: Menu | null;

    @OneToOne(() => ContainerLayout, containerLayout => containerLayout)
    @JoinColumn({ name: 'id', referencedColumnName: 'refId' })
    containerLayout: ContainerLayout;

    @OneToOne(() => ContainerStyle, containerStyle => containerStyle)
    @JoinColumn({ name: 'id', referencedColumnName: 'refId' })
    containerStyle: ContainerStyle;
        
    @OneToOne(() => TypographyStyle, typographyStyle => typographyStyle)
    @JoinColumn({ name: 'id', referencedColumnName: 'refId' })
    typographyStyle: TypographyStyle;
}
