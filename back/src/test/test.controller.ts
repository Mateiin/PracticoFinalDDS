import { Controller, Post } from '@nestjs/common';
import { MailService } from '../mail/mail.service';

@Controller('test')
export class TestController {
  constructor(private readonly mailService: MailService) {}

  @Post('email')
  async sendTestEmail() {
    await this.mailService.sendMail(
      'trinialbarracin13@gmail.com',
      'La vida es un carrusel',
      '<h1>¡Roguemos que funcione :)!</h1><p>Este es un test desde NestJS</p>'
    );
    return { ok: true };
  }
}
