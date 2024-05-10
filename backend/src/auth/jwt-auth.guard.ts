import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";
import { Reflector } from "@nestjs/core";


@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService,
        private readonly reflector: Reflector
    ) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest()
        const isPublic = this.reflector.get<boolean>( "isPublic", context.getHandler() );

        if (isPublic) {
            return true;
        }

        // const authHeader = req.headers.authorization;
        // const bearer = authHeader.split(' ')[0]
        // const token = authHeader.split(' ')[1]
        //
        // if (bearer != 'Bearer' && !token) {
        //     throw new UnauthorizedException({message: 'Пользователь не авторизован'})
        // }
        //
        // const user = this.jwtService.verify(token);
        // req.user = user;
        return true;
    }
}