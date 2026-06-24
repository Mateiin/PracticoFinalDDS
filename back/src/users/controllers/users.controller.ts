import { BadRequestException, Body, Controller, ForbiddenException, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UsersService } from '../services/users.service';
import { UserRole } from '../user-role.enum';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ChangeEmailDto } from '../dto/change-email.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAllDb();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/role')
  async updateRole(@Param('id') id: string, @Body('role') role: UserRole, @Req() req: any) {
    if (req.user.id === id) {
      throw new ForbiddenException('No podés cambiar tu propio rol');
    }
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

}
