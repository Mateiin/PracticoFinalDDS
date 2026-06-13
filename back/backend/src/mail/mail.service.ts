import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
  }

  async sendMail(to: string, subject: string, html: string) {
    return await this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'mateocaulloqgmail.com',
      subject,
      html,
    });
  }
}
