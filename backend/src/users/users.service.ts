import { Injectable } from '@nestjs/common';
import { User } from './users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

    async createUser(dto: CreateUserDto, activationLink: string): Promise<User> { 
        const user = await this.usersRepository.save({ ...dto, activationLink})
        return user;
    }
    
    async findAll(): Promise<User[]> {
        return await this.usersRepository.find();
    }

    async activation(activationLink: string): Promise<void> {
        const user = await this.usersRepository.findOne({where: {activationLink}})
        if (!user) {
            throw new Error('Некорректная ссылка')
        }
        user.isActivated = true;
        await this.usersRepository.save(user);
    }

    async getUserByEmail(email: string) {
        const user = await this.usersRepository.findOne({where: {email}});
        return user;
    }

    async getUserIdByEmail(dto: CreateUserDto): Promise<number> {
        const email = dto.email;
        const user = await this.usersRepository.findOne({where: {email}});
        if (user) {
            return user.id;
        } else {
            throw new Error('Пользователь с таким email не найден');
        }
    }
}
