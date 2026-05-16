import { Media } from "src/domains/media/entities/media.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Calendar {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    navigationId: string;

    @Column()
    title: string;

    @Column()
    startDate: Date;

    @Column()
    endDate: Date;

    @Column()
    description: string;

    @Column()
    fileId: string;

    @Column()
    category: string;

    @Column()
    url: string;

    @Column()
    allDay: boolean;

    @OneToOne(() => Media, media => media)
    @JoinColumn({ name: 'fileId', referencedColumnName: 'name' })
    media: Media;
}