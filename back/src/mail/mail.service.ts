import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private resend: Resend;
  private fromAddress: string;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY') ?? process.env.RESEND_API_KEY;
    this.fromAddress = this.config.get<string>('MAIL_FROM') ?? process.env.MAIL_FROM ?? 'onboarding@resend.dev';

    if (!apiKey) {
      this.logger.warn('No RESEND_API_KEY configured — los envíos de correo fallarán hasta configurar la variable.');
    }

    // Inicializamos Resend aunque apiKey sea undefined (la librería lanzará error al usarla)
    this.resend = new Resend(apiKey ?? '');
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const result = await this.resend.emails.send({
        from: this.fromAddress,
        to,
        subject,
        html,
      });
      return result;
    } catch (error) {
      this.logger.error('Error al enviar email:', error as any);
      throw error;
    }
  }
}