import { Folder } from 'src/folders/folders.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity({ name: 'tasks' })
export class Task {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false,  length: 25,  })
    task_name: string;

    @Column({ length: 255 })
    description: string;

    @Column({ type: 'timestamp' })
    deadline: Date;

    @Column({ type: 'timestamp' })
    last_change: Date;

    @Column({ nullable: false })
    folderId: number;

    @ManyToOne(() => Folder, folder => folder.tasks, { onDelete: 'CASCADE' })
    folder: Folder;
}
