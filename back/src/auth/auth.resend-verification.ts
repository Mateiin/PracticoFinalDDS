import { BadRequestException, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthResendVerificationController {
  constructor(
    private readonly userRepository: any,
    private readonly mailService: any,
  ) {}

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  async resendVerification(@Req() req) {
    const user = await this.userRepository.findOne({ where: { id: req.user.id } });

  if (user.isVerified) {
    throw new BadRequestException('El usuario ya está verificado');
  }

  user.verificationToken = randomUUID();
  await this.userRepository.save(user);

  await this.mailService.sendMail(
    user.email,
    'Reenvío de verificación',
    `<p>Haz clic aquí para verificar: 
    <a href="http://localhost:4200/verify-email?token=${user.verificationToken}">
    Verificar Email</a></p>`
  );

  return { message: 'Email reenviado' };
  }
}