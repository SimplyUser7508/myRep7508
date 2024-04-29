import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.register({
      secret: process.env.PRIVATE_KEY || 'SECRET',
      signOptions: {
        expiresIn: '30d'
      }
    }),
  ],
  exports: [
    AuthService,
    JwtModule,
    JwtAuthGuard
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    MailService
  ]
})
export class AuthModule {}