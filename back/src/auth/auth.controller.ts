import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsersService } from '../users/services/users.service';

@Controller('auth') 
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

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

  // --- NUEVAS RUTAS PARA RECUPERACIÓN DE CONTRASEÑA ---

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    // Le pasamos el email al servicio para que genere el token y mande el mail
    return this.usersService.forgotPassword(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string, nuevaClave: string }) {
    // Recibimos el token de la URL y la contraseña nueva
    return this.usersService.resetPassword(body.token, body.nuevaClave);
  }
}