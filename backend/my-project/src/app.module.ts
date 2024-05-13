import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { User } from "./users/users.entity";
import { UsersModule } from "./users/users.module";
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';
import { FoldersModule } from './folders/folders.module';
import { Task } from "./tasks/tasks.entity";
import { Folder } from "./folders/folders.entity";
import { AuthModule } from './auth/auth.module';
import * as fs from 'fs';
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { JwtModule } from "@nestjs/jwt";
import { APP_GUARD } from '@nestjs/core';
import { MailService } from "./mail/mail.service";
import { join } from 'path';
import { ServeStaticModule } from "@nestjs/serve-static";

@Module({
    controllers: [],
    providers: [{
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    MailService],
    imports: [
      ServeStaticModule.forRoot({
        rootPath: join(__dirname, '..', 'client'),
      }),
      JwtModule.register({
        secret: process.env.PRIVATE_KEY || 'SECRET',
        signOptions: {
          expiresIn: '30d'
        }
      }),
        ConfigModule.forRoot({
            envFilePath: './env'
        }),
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: process.env.HOST,
          port: Number(process.env.PORT),
          username: process.env.USER,
          password: process.env.PASSWORD,
          database: process.env.DB,
          entities: [User, Folder, Task],
          autoLoadEntities: true,
          synchronize: true,
          ssl: {
            ca: fs.readFileSync(process.env.CA)
          },
        }),
        UsersModule,
        FoldersModule,
        TasksModule,
        AuthModule
      ],
})
export class AppModule{}
