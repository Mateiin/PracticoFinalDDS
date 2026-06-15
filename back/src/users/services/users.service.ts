import { BadGatewayException, BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto'; // <-- Importamos crypto para generar el token
import { Repository } from "typeorm";
import { MailService } from '../../mail/mail.service'; // <-- Importamos tu servicio de mails
import { USERS_GATEWAY, UsersGateway } from '../gateways/users.gateway';
import { UserRole } from "../user-role.enum";
import { UserEntity } from "../user.entity";
import { ExternalUser } from '../user.types';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_GATEWAY)
    private readonly usersGateway: UsersGateway,

    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,

    private readonly cfg: ConfigService,

    private readonly jwtService: JwtService,

    private readonly mailService: MailService, // <-- Lo inyectamos acá
  ) {}

  private async sendVerificationEmail(to: string, token: string, subject: string) {
    const verificationLink = `http://localhost:4200/verify-email?token=${token}`;
    const result = await this.mailService.sendMail(
      to,
      subject,
      `<p>Hacé clic en el siguiente enlace para verificar tu cuenta:</p><a href="${verificationLink}">Verificar Email</a>`,
    );

    const warning = result?.error?.message as string | undefined;

    if (warning) {
      console.error('Resend rechazó el envío de verificación:', result.error);
    }

    return {
      verificationLink,
      delivered: !warning,
      warning,
    };
  }

  async findAll(): Promise<ExternalUser[]> {
    try {
      return await this.usersGateway.fetchAll();
    } catch {
      throw new BadGatewayException('Upstream users service failed');
    }
  }

  async findOne(id: number) {
    try {
      return await this.usersGateway.fetchById(id);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new NotFoundException(`El usuario con ID ${id} no existe JSONPLaceholer `);
      }
      throw new BadGatewayException('Error al obtener el usuario');
    }
  }

  async register(email: string, plainPassword: string) {
    const round = Number(this.cfg.get<string>('BCRYPT_COST')?? '12');
    const passwordHash = await bcrypt.hash(plainPassword, round);
    const countUsers = await this.usersRepo.count();
    const role = countUsers === 0 ? UserRole.ADMIN : UserRole.USER;

    // 1. Generamos el token de verificación
    const emailVerificationToken = crypto.randomUUID();

    // 2. Armamos el usuario y lo guardamos con su token
    const entity = this.usersRepo.create({ 
      email, 
      passwordHash, 
      role,
      emailVerificationToken 
    });
    const savedUser = await this.usersRepo.save(entity);

    // 3. Enviamos el mail
    const emailDelivery = await this.sendVerificationEmail(
      email,
      emailVerificationToken,
      'Verificá tu cuenta',
    );

    // 4. Generamos el JWT para autenticación automática
    const payload = { sub: savedUser.id, email: savedUser.email, role: savedUser.role };
    const access_token = await this.jwtService.signAsync(payload);

    // 5. Limpiamos datos sensibles de la respuesta (incluyendo el token)
    const { passwordHash: _, emailVerificationToken: __, ...userResponse } = savedUser;

    return {
      access_token,
      user: userResponse,
      emailDelivery,
    };
  }

  async login(email: string, plainPassword: string) {
    const cleanEmail = email.trim().toLowerCase();

    const q = this.usersRepo.createQueryBuilder('u')
    .addSelect('u.passwordHash')
    .where('u.email = :email', { email: cleanEmail });
    const user = await q.getOne();

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const ok = await bcrypt.compare(plainPassword, user.passwordHash);

    if (!ok) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    return { access_token: token };
  }

  async verifyEmail(token: string) {
    const user = await this.usersRepo.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Token inválido o expirado');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await this.usersRepo.save(user);

    return { message: 'Email verificado correctamente' };
  }

  async resendVerification(userId: string) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('El usuario ya está verificado');
    }

    user.emailVerificationToken = crypto.randomUUID();
    await this.usersRepo.save(user);

    const emailDelivery = await this.sendVerificationEmail(
      user.email,
      user.emailVerificationToken,
      'Reenvío de verificación',
    );

    return {
      message: 'Email reenviado',
      emailDelivery,
    };
  }

  async getMe(userId: string) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isEmailVerified,
    };
  }
}
