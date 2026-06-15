import { BadGatewayException, Inject, Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Repository } from "typeorm";
import { MailService } from '../../mail/mail.service';
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

    const emailVerificationToken = crypto.randomUUID();

    const entity = this.usersRepo.create({ 
      email, 
      passwordHash, 
      role,
      emailVerificationToken 
    });
    const savedUser = await this.usersRepo.save(entity);

    const link = `http://localhost:4200/verify-email?token=${emailVerificationToken}`;
    await this.mailService.sendMail(
      email,
      'Verificá tu cuenta',
      `<p>Hacé clic en el siguiente enlace para verificar tu cuenta:</p><a href="${link}">Verificar Email</a>`
    );

    const payload = { sub: savedUser.id, email: savedUser.email, role: savedUser.role };
    const access_token = await this.jwtService.signAsync(payload);

    const { passwordHash: _, emailVerificationToken: __, ...userResponse } = savedUser;

    return { access_token, user: userResponse };
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

    return {
      access_token: token,
      user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt },
    };
  }

  async findById(id: string): Promise<{ id: string; email: string; role: UserRole; createdAt: Date } | null> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) return null;
    return { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt };
  }

  async updateRole(id: string, newRole: UserRole): Promise<{ id: string; email: string; role: UserRole; createdAt: Date }> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    user.role = newRole;
    const saved = await this.usersRepo.save(user);
    return { id: saved.id, email: saved.email, role: saved.role, createdAt: saved.createdAt };
  }
}
