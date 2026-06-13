import { JwtService } from '@nestjs/jwt';
import { BadGatewayException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { ExternalUser } from '../user.types';
import { USERS_GATEWAY, UsersGateway } from '../gateways/users.gateway';
import { UserEntity } from "../user.entity";
import { UserRole } from "../user-role.enum";

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_GATEWAY)
    private readonly usersGateway: UsersGateway,

    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,

    private readonly cfg: ConfigService,

    private readonly jwtService: JwtService,
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
    return await this.usersRepo.save(entity);
  }

  async login(email: string, plainPassword: string) {
    const cleanEmail = email.trim().toLowerCase();

    const q = this.usersRepo.createQueryBuilder('u')
    .addSelect('u.passwordHash')
    .where('u.email = :email', { email });
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

    //devolvemos el tojen al frontend
    return {access_token: token}

   
  }
}


