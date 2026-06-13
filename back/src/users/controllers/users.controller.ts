import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UsersService } from '../services/users.service';
import { UserRole } from '../user-role.enum';
import { ExternalUser } from '../user.types';
import { MailService } from '../../mail/mail.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll(): Promise<ExternalUser[]> {
    return this.usersService.findAll();
  }

  //src/users/controllers/users.controller.ts
  @Get(':id')
  findOne(@Param('id') id: string) {
    // convertimos el ID de la URL a numero y llamamos al servicio para buscar el usuario
    // como el servicio es async (usa axios), devolvemos la promesa
    return this.usersService.findOne(Number(id));
  }

  @Post('test-email')
  async testEmail(): Promise<{ ok: boolean; result?: any; error?: string }> {
    try {
      const result = await this.mailService.sendMail(
        'mateocaullo@gmail.com',
        'Prueba de Verificación',
        '<h1>¡Funciona!</h1>',
      );
      return { ok: true, result };
    } catch (error) {
      console.error('Error en test-email:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { ok: false, error: errorMessage };
    }
  }
}
