import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './services/users.service';

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
}