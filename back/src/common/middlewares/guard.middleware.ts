import {
    applyDecorators,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export function VerifiedOnly() {
  return applyDecorators(UseGuards(JwtAuthGuard, VerifiedGuard));
}


@Injectable()
export class VerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenException('Debes verificar tu email para acceder a este recurso');
    }

    return true;
  }
}
