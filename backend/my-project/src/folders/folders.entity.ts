import { Task } from 'src/tasks/tasks.entity';
import { User } from 'src/users/users.entity';
import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    Unique, 
    ManyToOne, 
    OneToMany 
} from 'typeorm';

@Entity({ name: 'folders' })
@Unique(['folder_name'])
export class Folder {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, length: 35 })
    folder_name: string;

    @Column({ nullable: false })
    userId: number;

    @ManyToOne(() => User, user => user.folders, { onDelete: 'CASCADE' })
    user: User;

    @OneToMany(() => Task, task => task.folder)
    tasks: Task[];
}
