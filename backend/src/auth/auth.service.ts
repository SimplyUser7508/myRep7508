import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {

    constructor(
        private userService: UsersService,
        private jwtService: JwtService,
        private mailService: MailService
    ) {}

    async login(userDto: CreateUserDto) {
        const user = await this.validateUser(userDto);
        return this.generateToken(user)
    }

    async registration(userDto: CreateUserDto) {
        const candidate = await this.userService.getUserByEmail(userDto.email);
        if (candidate) {
            throw new HttpException('Пользователь с таким email существует', HttpStatus.BAD_REQUEST);
        }
        const hashPassword = await bcrypt.hash(userDto.password, 5);
        const activationLink = uuidv4();
        const user = await this.userService.createUser({...userDto, password: hashPassword}, activationLink);
        await this.mailService.sendEmail(userDto.email, `${process.env.API_URL}/users/activate/${activationLink}`);

        return this.generateToken(user);
    }

    async getUserIdFromToken(token: string): Promise<number> {
        const decodedToken = this.jwtService.decode(token);
        if (decodedToken && typeof decodedToken === 'object' && decodedToken.hasOwnProperty('email')) {
          const userEmail = decodedToken['email'];
          const user = await this.userService.getUserByEmail(userEmail);
          if (user) {
            return user.id;
          } else {
            throw new Error('Пользователь с таким email не найден');
          }
        } else {
          throw new Error('Неверный формат токена или отсутствует email');
        }
      }

    private async generateToken(user) {
        const paylaod = {email: user.email, id: user.id, isActivated: user.isActivated};
        return {
            token: this.jwtService.sign(paylaod)
        }
    }

    private async validateUser(userDto: CreateUserDto) {
        const user = await this.userService.getUserByEmail(userDto.email);
        const passwordEquals = await bcrypt.compare(userDto.password, user.password);
        if (user && passwordEquals && user.isActivated) {
            return user; 
        }
        throw new UnauthorizedException({message: 'Неверный email или пароль'});
    }
}