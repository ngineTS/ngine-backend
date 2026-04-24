import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class NavigationType {

    @PrimaryGeneratedColumn()
    id: string;

    @Column({ unique: true })
    name: string;

    @Column()
    displayLabel: string;

    @Column()
    description: string;

    @Column()
    thumbnailImage: string;
}

