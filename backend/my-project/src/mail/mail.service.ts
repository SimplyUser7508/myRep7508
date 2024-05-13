import { Injectable } from "@nestjs/common";
import { MailerService } from '@nestjs-modules/mailer';
import * as nodemailer from 'nodemailer';       


@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
        service: 'gmail',
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });
  }

  async sendEmail(to: string, link: string): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: 'Активируйте аккаунт на ' + process.env.API_URL,
      text: '',
      html: `
        <div>
          <h1>Для активации перейдите по ссылке</h1>
          <a href="${link}">${link}</a>
        </div>
      `,
    }); 
  }
}