import { JwtStrategy } from './jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from '../auth/auth.controller';
import { Global, Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { JsonPlaceholderUsersGateway } from './gateways/jsonplaceholder-users.gateway';
import { LocalUsersGateway } from './gateways/local-users.gateway';
import { USERS_GATEWAY } from './gateways/users.gateway';
import { UsersService } from './services/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { MailModule } from '../mail/mail.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_SECRET') || 'un_secreto_muy_seguro_para_desarrollo',
        signOptions: { expiresIn: '1h' },// dice que el token vence en 1 hora
      }),
    }),
],
  controllers: [UsersController, AuthController],
  providers: [
    UsersService,
    JwtStrategy,
    { provide: USERS_GATEWAY, useFactory: () => {
        console.log('Usando Gateway Local');
        return new LocalUsersGateway();
      
      console.log('Usando Gateway Externo');
      return new JsonPlaceholderUsersGateway();
    }},
  ],
  exports: [UsersService, USERS_GATEWAY],
})
export class UsersModule {}
