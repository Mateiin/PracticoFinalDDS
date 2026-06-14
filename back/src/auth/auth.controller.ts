import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsersService } from '../users/services/users.service';


@Controller('auth') 
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() body: any) {
    // Le pasamos el email y la contraseña al método de tu servicio
    return this.usersService.register(body.email, body.password);
  }

  @Post('login')
  async login(@Body() body: any) {
    // Llamamos al método de login que compara los hashes
    return this.usersService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    const userId = req.user.id;
    return this.usersService.findById(userId);
  }
}
