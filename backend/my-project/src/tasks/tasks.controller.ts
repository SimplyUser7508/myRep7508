import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Controller('tasks')
export class TasksController {
    constructor(private taskService: TasksService) {}

    @Post(':folderId')
    create(@Body() taskDto: CreateTaskDto, @Param('folderId') folderId) {
        return this.taskService.createTask(taskDto, folderId);
    }

    @Get(':folderId/:sortType')
    getAll(@Param('folderId') folderId, @Param('sortType') sortType) {
        return this.taskService.findAll(folderId, sortType);
    }

    @Put(':taskId')
    edit(@Body() taskDto: CreateTaskDto, @Param('taskId') taskId) {
        return this.taskService.updateTask(taskDto, taskId);
    }

    @Delete(':taskId')
    delete(@Param('taskId') taskId) {
        return this.taskService.deleteTask(taskId)
    }
}
