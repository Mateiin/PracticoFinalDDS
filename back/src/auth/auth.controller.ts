import { Body, Controller, Post, Req, UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsersService } from '../users/services/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() body: any) {
    return this.usersService.register(body.email, body.password);
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.usersService.login(body.email, body.password);
  }

  @Post('verify-email')
  async verifyEmail(@Body('token') token: string) {
    // Acá llamas a una función que vas a crear en UsersService
    return await this.usersService.verifyEmail(token);
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  async resendVerification(@Req() req: any) {
    return await this.usersService.resendVerification(req.user.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    return await this.usersService.getMe(req.user.id);
  }
}
