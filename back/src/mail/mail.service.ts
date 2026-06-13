import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const result = await this.resend.emails.send({
        from: 'onboarding@resend.dev', // remitente válido para pruebas, solo envia mails al mail que se registro
        to,
        subject,
        html,
      });
      console.log('Resend result:', result);
      return result;
    } catch (err) {
      console.error('Resend error:', err);
      throw err;
    }
  }
}
