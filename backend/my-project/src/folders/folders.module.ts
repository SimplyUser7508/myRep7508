import { Module } from '@nestjs/common';
import { FoldersController } from './folders.controller';
import { FoldersService } from './folders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';
import { Folder } from './folders.entity';
import { Task } from 'src/tasks/tasks.entity';
import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([Folder, User, Task])],
  controllers: [FoldersController],
  providers: [FoldersService, UsersService, AuthService, JwtService, MailService ]
})
export class FoldersModule {}
