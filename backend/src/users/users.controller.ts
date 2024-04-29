import { 
    Controller, 
    Get,
    Param,
    Res
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Public } from 'src/auth/auth.set-metadata';
import { Response } from 'express';

@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) {}

    @Public()
    @Get('/activate/:link') 
    activation(@Param('link') link, @Res() res: Response) {
        this.userService.activation(link)
        return res.redirect(process.env.CLIENT_URL);
    }
}
