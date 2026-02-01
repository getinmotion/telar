import { DataSource } from 'typeorm';
import { EmailVerification } from './entities/email-verification.entity';

export const emailVerificationsProviders = [
  {
    provide: 'EMAIL_VERIFICATIONS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(EmailVerification),
    inject: ['DATA_SOURCE'],
  },
];

