import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST') ?? process.env.SMTP_HOST;
    const port = parseInt(this.config.get<string>('SMTP_PORT') ?? process.env.SMTP_PORT ?? '0', 10);
    const user = this.config.get<string>('SMTP_USER') ?? process.env.SMTP_USER;
    const pass = this.config.get<string>('SMTP_PASS') ?? process.env.SMTP_PASS;

    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: false,
        auth: { user, pass },
      });
    } else {
      this.logger.warn('SMTP no configurado. Los correos no se enviarán.');
    }
  }

  async sendMail(to: string, subject: string, html: string) {
    if (!this.transporter) {
      this.logger.error('No se puede enviar el mail: SMTP no configurado.');
      throw new Error('Servicio de mail no configurado (faltan variables SMTP)');
    }

    try {
      const from = this.config.get<string>('SMTP_FROM') ?? process.env.SMTP_FROM;
      const result = await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      this.logger.log('Email enviado:', result.messageId);
      return result;
    } catch (error) {
      this.logger.error('Error al enviar email:', error as any);
      throw error;
    }
  }
}
