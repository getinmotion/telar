import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './resources/auth/auth.module';
import { UsersModule } from './resources/users/users.module';
import { MailModule } from './resources/mail/mail.module';
import { UserProfilesModule } from './resources/user-profiles/user-profiles.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProgressModule } from './resources/user-progress/user-progress.module';
import { EmailVerificationsModule } from './resources/email-verifications/email-verifications.module';
import { BrandThemesModule } from './resources/brand-themes/brand-themes.module';
import { ArtisanShopsModule } from './resources/artisan-shops/artisan-shops.module';
import { UserMasterContextModule } from './resources/user-master-context/user-master-context.module';
import { UserMaturityActionsModule } from './resources/user-maturity-actions/user-maturity-actions.module';
import { ProductsModule } from './resources/products/products.module';
import { ProductCategoriesModule } from './resources/product-categories/product-categories.module';
import { AgentTasksModule } from './resources/agent-tasks/agent-tasks.module';
import { UserMaturityScoresModule } from './resources/user-maturity-scores/user-maturity-scores.module';
import { MasterCoordinatorContextModule } from './resources/master-coordinator-context/master-coordinator-context.module';
import { AiModule } from './resources/ai/ai.module';
import { AnalyticsEventsModule } from './resources/analytics-events/analytics-events.module';
import { AgentDeliverablesModule } from './resources/agent-deliverables/agent-deliverables.module';
import { UserAchievementsModule } from './resources/user-achievements/user-achievements.module';
import { TaskStepsModule } from './resources/task-steps/task-steps.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    MailModule,
    UserProfilesModule,
    UserProgressModule,
    EmailVerificationsModule,
    BrandThemesModule,
    ArtisanShopsModule,
    UserMasterContextModule,
    UserMaturityActionsModule,
    ProductsModule,
    ProductCategoriesModule,
    AgentTasksModule,
    UserMaturityScoresModule,
    MasterCoordinatorContextModule,
    AiModule,
    AnalyticsEventsModule,
    AgentDeliverablesModule,
    UserAchievementsModule,
    TaskStepsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
