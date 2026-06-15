import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private resend: Resend | null = null;
  private fromAddress: string;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY') ?? process.env.RESEND_API_KEY;
    this.fromAddress = this.config.get<string>('MAIL_FROM') ?? process.env.MAIL_FROM ?? 'onboarding@resend.dev';

    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn('No RESEND_API_KEY configurada. Los correos no se enviarán.');
    }
  }

  async sendMail(to: string, subject: string, html: string) {
    if (!this.resend) {
      this.logger.error('No se puede enviar el mail: Resend no está inicializado.');
      throw new Error('Servicio de mail no configurado (falta API Key)');
    }

    try {
      const result = await this.resend.emails.send({
        from: this.fromAddress,
        to: to,
        subject: subject,
        html: html,
      });
      return result;
    } catch (error) {
      this.logger.error('Error al enviar email:', error as any);
      throw error;
    }
  }
}
