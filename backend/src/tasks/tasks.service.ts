import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from './tasks.entity';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task) private tasksRepository: Repository<Task>
    ) {}

    async createTask(dto: CreateTaskDto, folderId: number): Promise<Task> {
        const timestamp = Date.now();
        const formattedDateTime = new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ');
        const last_change = formattedDateTime;

        const taskData = { ...dto, folderId, last_change };
        if (!dto.task_name) {
            throw new BadRequestException('Имя задачи обязательно для создания');
        }
        
        const task = await this.tasksRepository.save(taskData);
        return task;
    }

    async findAll(folderId: number, sortBy: string): Promise<Task[]> {
        const queryBuilder = this.tasksRepository.createQueryBuilder('tasks');
        queryBuilder.where('tasks.folderId = :folderId', { folderId });

        switch (sortBy) {
            case 'lexicographic':
                queryBuilder.orderBy('tasks.task_name', 'ASC');
                break;
            case 'deadline':
                queryBuilder.orderBy('tasks.deadline', 'ASC');
                break;
            default:
                queryBuilder.orderBy('tasks.last_change', 'DESC');
                break;
        }
        return await queryBuilder.getMany();
    }

    async updateTask(dto: CreateTaskDto, taskId: number): Promise<string> {
        const task = await this.tasksRepository.update(taskId, dto);
        return 'Задача успешно отредактирована';
    }

    async deleteTask(taskId: number): Promise<string> {
        const task = await this.tasksRepository.delete(taskId)
        return 'Задача успешно удалена';
    }
}

