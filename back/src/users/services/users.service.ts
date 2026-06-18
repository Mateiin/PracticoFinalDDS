import { BadGatewayException, Inject, Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
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

  async findAll(): Promise<ExternalUser[]> {
    try {
      return await this.usersGateway.fetchAll();
    } catch {
      throw new BadGatewayException('Upstream users service failed');
    }
  }

  async findAllDb(): Promise<UserEntity[]> {
    return this.usersRepo.find();
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
    const link = `http://localhost:4200/verify-email?token=${emailVerificationToken}`;
    await this.mailService.sendMail(
      email,
      'Verificá tu cuenta',
      `<p>Hacé clic en el siguiente enlace para verificar tu cuenta:</p><a href="${link}">Verificar Email</a>`
    );

    // 4. Generamos el JWT para autenticación automática
    const payload = { sub: savedUser.id, email: savedUser.email, role: savedUser.role };
    const access_token = await this.jwtService.signAsync(payload);

    // 5. Limpiamos datos sensibles de la respuesta (incluyendo el token)
    const { passwordHash: _, emailVerificationToken: __, ...userResponse } = savedUser;

    return { access_token, user: userResponse };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) return;

    const token = crypto.randomUUID();
    const expiration = new Date(Date.now() + 3600_000);

    user.passwordResetToken = token;
    user.passwordResetTokenExpiration = expiration;
    await this.usersRepo.save(user);

    const link = `http://localhost:4200/reset-password?token=${token}`;
    try {
      await this.mailService.sendMail(
        email,
        'Recuperación de contraseña',
        `<p>Hacé clic en este enlace para restablecer tu contraseña:</p><a href="${link}">Restablecer Contraseña</a>`
      );
    } catch {
      // Si falla el envío de mail, igual el token queda guardado
    }
  }

  async resetPassword(token: string, nuevaClave: string): Promise<void> {
    const user = await this.usersRepo.findOne({
      where: { passwordResetToken: token },
    });

    if (!user || !user.passwordResetTokenExpiration) {
      throw new BadRequestException('Token inválido');
    }

    if (user.passwordResetTokenExpiration < new Date()) {
      throw new BadRequestException('El token ha expirado');
    }

    const round = Number(this.cfg.get<string>('BCRYPT_COST') ?? '12');
    user.passwordHash = await bcrypt.hash(nuevaClave, round);
    user.passwordResetToken = null;
    user.passwordResetTokenExpiration = null;
    await this.usersRepo.save(user);
  }

  async updateRole(id: string, role: UserRole): Promise<void> {
    await this.usersRepo.update(id, { role });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const q = this.usersRepo.createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.id = :id', { id: userId });
    const user = await q.getOne();

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      throw new BadRequestException('La contraseña actual no es correcta');
    }

    const round = Number(this.cfg.get<string>('BCRYPT_COST') ?? '12');
    user.passwordHash = await bcrypt.hash(newPassword, round);
    await this.usersRepo.save(user);
  }

  async changeEmail(userId: string, newEmail: string, currentPassword: string): Promise<void> {
    const q = this.usersRepo.createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.id = :id', { id: userId });
    const user = await q.getOne();

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      throw new BadRequestException('La contraseña actual no es correcta');
    }

    const existing = await this.usersRepo.findOne({ where: { email: newEmail } });
    if (existing) {
      throw new BadRequestException('El email ya está en uso');
    }

    user.email = newEmail;
    user.isEmailVerified = false;
    user.emailVerificationToken = null;
    await this.usersRepo.save(user);
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

    const { passwordHash: _, emailVerificationToken: __, passwordResetToken: ___, passwordResetTokenExpiration: ____, ...userResponse } = user;

    return { access_token: token, user: userResponse };
  }
}
