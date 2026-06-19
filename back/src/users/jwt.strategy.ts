import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity'; // <-- Fijate que acá busca la entidad en la misma carpeta

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    cfg: ConfigService,
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: cfg.get<string>('JWT_SECRET') || 'un_secreto_muy_seguro_para_desarrollo',
    });
  }

  async validate(payload: { sub: string }) {
    const user = await this.usersRepo.findOne({ where: { id: payload.sub } });
    
    if (!user) {
      return null;
    }
    
    return { id: user.id, role: user.role, email: user.email, isEmailVerified: user.isEmailVerified };
  }
}