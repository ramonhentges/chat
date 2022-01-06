import { IS_PUBLIC_KEY } from '@/constants/constants';
import { JwsTokenDto } from '@/modules/auth/dto/jws-token.dto';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuardDouble extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (isPublic) {
      return true;
    }
    const req = context.switchToHttp().getRequest();
    if (req.headers.authorization) {
      const user = JSON.parse(req.headers.authorization);
      const jwtDto: JwsTokenDto = { id: user.id, username: user.username };
      req.user = jwtDto;
      return true;
    }
    throw new UnauthorizedException();
  }
}
