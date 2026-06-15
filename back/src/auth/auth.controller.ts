import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/services/users.service';
import { UserEntity } from '../users/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly mailService: MailService,
  ) {}

  @Post('register')
  async register(@Body() body: any) {
    return this.usersService.register(body.email, body.password);
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.usersService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    const userId = req.user.id;
    return this.usersService.findById(userId);
  }

  @Post('verify-email')
  async verifyEmail(@Body('token') token: string) {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Token inválido o expirado');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await this.userRepository.save(user);

    return { message: 'Email verificado correctamente' };
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  async resendVerification(@Req() req: any) {
    const user = await this.userRepository.findOne({
      where: { id: req.user.id },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('El usuario ya está verificado');
    }

    user.emailVerificationToken = crypto.randomUUID();
    await this.userRepository.save(user);

    const link = `http://localhost:4200/verify-email?token=${user.emailVerificationToken}`;
    await this.mailService.sendMail(
      user.email,
      'Reenvío de verificación',
      `<p>Haz clic aquí para verificar tu email: <a href="${link}">Verificar Email</a></p>`,
    );

    return { message: 'Email reenviado' };
  }
}
