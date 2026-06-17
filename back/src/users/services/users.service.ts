import { JwtService } from '@nestjs/jwt';
import { BadGatewayException, Inject, Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { ExternalUser } from '../user.types';
import { USERS_GATEWAY, UsersGateway } from '../gateways/users.gateway';
import { UserEntity } from "../user.entity";
import { UserRole } from "../user-role.enum";
import { MailService } from '../../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_GATEWAY)
    private readonly usersGateway: UsersGateway,

    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,

    private readonly cfg: ConfigService,

    private readonly jwtService: JwtService,

    private readonly mailService: MailService,
  ) {}

  async findAll(): Promise<ExternalUser[]> {
    try {
      return await this.usersGateway.fetchAll();
    } catch {
      throw new BadGatewayException('Upstream users service failed');
    }
  }

  //src/users/services/users.service.ts
  async findOne(id: number) {
    try {
      // Llamamos al gateway para buscar el usuario
      return await this.usersGateway.fetchById(id);
    } catch (error: any) {
      // si axios detecta un error 404 (Not Found) en la API externa
      if (error.response?.status === 404) {
        throw new NotFoundException(`El usuario con ID ${id} no existe JSONPLaceholer `);
      }
      // si es otro tipo de error, lanamos el error general que ya usa tu servicio
      throw new BadGatewayException('Error al obtener el usuario');

    }
  }

  async register(email: string, plainPassword: string) {
    // SE LEE QUE TAN COMPLEJA DEBE SER LA ENCRIPTACION DESDE EL .env
    const round = Number(this.cfg.get<string>('BCRYPT_COST')?? '12');

    //SE TRANSFORMA LA CONTRASEÑA DE TEXTO A UN HASH PARA QUE SEA INDESCIFRABLE
    const passwordHash = await bcrypt.hash(plainPassword, round);

    //SE VERIFICA SI ES EL PRIMER USUARIO DE LA BD 
    const countUsers = await this.usersRepo.count();

    //SI LA BD ESTA VACIA, EL PRIMER USUARIO ES ADMIN Y LOS DEMAS SON USER
    const role = countUsers === 0 ? UserRole.ADMIN : UserRole.USER;

    //SE ARMA EL USUARIO Y SE GUARDA
    const entity = this.usersRepo.create({ email, passwordHash, role });
    const saved = await this.usersRepo.save(entity);

    //generamos token JWT
    const payload = { sub: saved.id, email: saved.email, role: saved.role };
    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      user: { id: saved.id, email: saved.email, role: saved.role, createdAt: saved.createdAt },
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

    //se arma una mochila de datos que se llama paylod que es donde va a viajar encriptado el token
    const payload = { sub: user.id, email: user.email, role: user.role };
    
    //se firma el token con nuestro servicio
    const token = await this.jwtService.signAsync(payload);

    //devolvemos el tojen al frontend junto con el usuario
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

  

  async forgotPassword(email: string) {
    const cleanEmail = email.trim().toLowerCase();
    const user = await this.usersRepo.findOne({ where: { email: cleanEmail } });

    // Por seguridad, si el usuario no existe, no tiramos error. 
    // Fingimos demencia para que los hackers no adivinen correos[cite: 58].
    if (!user) {
      return { message: 'Si el correo existe, se envió un enlace.' };
    }

    // 1. Generamos un token especial que expira en 15 minutos
    const payload = { sub: user.id, email: user.email, purpose: 'reset-password' };
    const resetToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });

    // 2. Armamos el link que va a apuntar a tu frontend de Angular
    const recoveryLink = `http://localhost:4200/reset-password?token=${resetToken}`;

    // 3. Mandamos el mail (Ajustá este método según cómo se llame en tu MailService)
    await this.mailService.sendMail(
      user.email,
      'Recuperación de contraseña - UTN FRVM',
      `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Recuperación de contraseña</h2>
        <p>Hola,</p>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
        <p>Hacé clic en el siguiente botón para crear una nueva:</p>
        <a href="${recoveryLink}" style="background-color: #0d6efd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0;">Recuperar Contraseña</a>
        <p style="color: #6c757d; font-size: 0.9em;">Este enlace es válido por 15 minutos. Si no solicitaste este cambio, ignorá este correo.</p>
      </div>`
    );

    return { message: 'Si el correo existe, se envió un enlace.' };
  }

  async resetPassword(token: string, nuevaClave: string) {
    try {
      // 1. Verificamos que el token sea válido y no esté vencido
      const payload = await this.jwtService.verifyAsync(token);

      // Verificamos que sea un token exclusivo de recuperación
      if (payload.purpose !== 'reset-password') {
        throw new UnauthorizedException('Token inválido para esta operación');
      }

      // 2. Buscamos al usuario dueño de ese token
      const user = await this.usersRepo.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // 3. Encriptamos la clave nueva que llegó del frontend
      const round = Number(this.cfg.get<string>('BCRYPT_COST') ?? '12');
      user.passwordHash = await bcrypt.hash(nuevaClave, round);

      // 4. Guardamos la nueva clave en la base de datos
      await this.usersRepo.save(user);

      return { message: 'Contraseña actualizada con éxito' };
    } catch (error) {
      throw new UnauthorizedException('El enlace es inválido o ha expirado. Por favor, solicitá uno nuevo.');
    }
  }
}


