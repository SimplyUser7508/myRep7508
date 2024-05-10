import { Folder } from 'src/folders/folders.entity';
import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    Unique, 
    OneToMany 
} from 'typeorm';

@Entity({ name: 'users' })
@Unique(['email'])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    email: string;

    @Column({ nullable: false })
    password: string;

    @Column({ default: false })
    isActivated: boolean;

    @Column({ nullable: false })
    activationLink: string;

    @OneToMany(() => Folder, folder => folder.user)
    folders: Folder[];
}
