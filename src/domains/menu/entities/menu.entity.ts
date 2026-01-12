import { ContainerLayout } from "src/domains/container-layout/entities/container-layout.entity";
import { ContainerStyle } from "src/domains/container-style/entities/container-style.entity";
import { TypographyStyle } from "src/domains/typography-style/entities/typography-style.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Menu {
    @PrimaryGeneratedColumn()
    id: string;
    
    @Column()
    navigationId: string;

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
