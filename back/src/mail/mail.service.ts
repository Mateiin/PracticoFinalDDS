import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? '0', 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const result = await this.transporter.sendMail({
        from: process.env.SMTP_FROM, // remitente válido para pruebas, solo envia mails al mail que se registro
        to,
        subject,
        html,
      });
      console.log('SMTP:', result);
      return result;
    } catch (err) {
      console.error('SMTP error:', err);
      throw err;
    }
  }
}
