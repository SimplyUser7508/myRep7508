import { 
    Body, 
    Controller, 
    Get,
    Post, 
    UsePipes,
    Headers
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { Public } from './auth.set-metadata';
import { ValidationPipe } from 'src/pipes/validation.pipe';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('/login')
    login(@Body() userDto: CreateUserDto) {
        return this.authService.login(userDto)
    }

    @Post('/registration')
    registration(@Body() userDto: CreateUserDto) {
        return this.authService.registration(userDto)
    }

    @Public()
    @Get('/profile')
    async getProfile(@Headers('Authorization') authHeader: string) {
        const token = authHeader.split(' ')[1]; 
        return this.authService.getUserIdFromToken(token);
    }
}
