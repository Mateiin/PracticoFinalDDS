import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
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

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    return this.usersService.getMe(req.user.id);
  }

  @Post('verify-email')
  async verifyEmail(@Body('token') token: string) {
    return this.usersService.verifyEmail(token);
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  async resendVerification(@Req() req: any) {
    return this.usersService.resendVerification(req.user.id);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.usersService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(@Body('token') token: string, @Body('password') password: string) {
    return this.usersService.resetPassword(token, password);
  }
}
