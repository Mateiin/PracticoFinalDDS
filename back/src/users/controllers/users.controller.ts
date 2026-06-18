import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { MailService } from '../../mail/mail.service';
import { UsersService } from '../services/users.service';
import { UserRole } from '../user-role.enum';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ChangeEmailDto } from '../dto/change-email.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAllDb();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/role')
  async updateRole(@Param('id') id: string, @Body('role') role: UserRole) {
    await this.usersService.updateRole(id, role);
    return this.usersService.findAllDb().then(users => users.find(u => u.id === id));
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }
    await this.usersService.changePassword(req.user.id, dto.currentPassword, dto.newPassword);
    return { message: 'Contraseña actualizada correctamente' };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/email')
  async changeEmail(@Req() req: any, @Body() dto: ChangeEmailDto) {
    await this.usersService.changeEmail(req.user.id, dto.newEmail, dto.currentPassword);
    return { message: 'Email actualizado correctamente' };
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
