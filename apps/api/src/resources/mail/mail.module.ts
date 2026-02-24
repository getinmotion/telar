import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const smtpPort = configService.get<number>('SMTP_PORT') || 587;
        const isSecure = smtpPort === 465;

        return {
          transport: {
            host: configService.get<string>('SMTP_HOST'),
            port: smtpPort,
            secure: isSecure, // true para puerto 465, false para otros
            auth: {
              user: configService.get<string>('SMTP_USER'),
              pass: configService.get<string>('SMTP_PASS'),
            },
            // Configuración adicional para manejar SSL/TLS
            tls: {
              rejectUnauthorized: false, // Solo para desarrollo/testing
            },
            ...(smtpPort === 587 && {
              requireTLS: true, // Forzar STARTTLS en puerto 587
            }),
          },
          defaults: {
            from: `"${configService.get<string>('MAIL_FROM_NAME')}" <${configService.get<string>('MAIL_FROM_EMAIL')}>`,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
