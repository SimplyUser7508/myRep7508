import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './tasks.entity';
import { Folder } from 'src/folders/folders.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Folder])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
