import { Body, BadRequestException, Controller, Post } from '@nestjs/common';

@Controller('auth')
export class AuthVerifyEmailController {
  constructor(private readonly userRepository: any) {}

  @Post('verify-email')
  async verifyEmail(@Body('token') token: string) {
    const user = await this.userRepository.findOne({ where: { verificationToken: token } });

    if (!user) {
      throw new BadRequestException('Token inválido o expirado');
    }

    user.isVerified = true;
    user.verificationToken = null;
    await this.userRepository.save(user);

    return { message: 'Email verificado' };
  }
}