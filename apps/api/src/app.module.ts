import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './resources/auth/auth.module';
import { UsersModule } from './resources/users/users.module';
import { MailModule } from './resources/mail/mail.module';
import { UserProfilesModule } from './resources/user-profiles/user-profiles.module';
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
import { WishlistModule } from './resources/wishlist/wishlist.module';
import { AddressesModule } from './resources/addresses/addresses.module';
import { CartModule } from './resources/cart/cart.module';
import { CartItemsModule } from './resources/cart-items/cart-items.module';
import { OrdersModule } from './resources/orders/orders.module';
import { OrderItemsModule } from './resources/order-items/order-items.module';
import { PendingGiftCardOrdersModule } from './resources/pending-gift-card-orders/pending-gift-card-orders.module';
import { GiftCardsModule } from './resources/gift-cards/gift-cards.module';
import { CheckoutsModule } from './resources/checkouts/checkouts.module';
import { UserRolesModule } from './resources/user-roles/user-roles.module';
import { ServientregaModule } from './resources/servientrega/servientrega.module';
import { CartShippingInfoModule } from './resources/cart-shipping-info/cart-shipping-info.module';
import { NotificationsModule } from './resources/notifications/notifications.module';
import { ProductModerationHistoryModule } from './resources/product-moderation-history/product-moderation-history.module';
import { CobreModule } from './resources/cobre/cobre.module';
import { ProductVariantsModule } from './resources/product-variants/product-variants.module';
import { InventoryMovementsModule } from './resources/inventory-movements/inventory-movements.module';
import { FileUploadModule } from './resources/file-upload/file-upload.module';
import { S3Module } from './common/services/s3/s3.module';
import { CmsModule } from './resources/cms/cms.module';
import { CmsSectionsModule } from './resources/cms-sections/cms-sections.module';
import { PaymentsModule } from './resources/payments/payments.module';
import { StoresModule } from './resources/stores/stores.module';
import { ProductsNewModule } from './resources/products-new/products-new.module';
import { CraftsModule } from './resources/crafts/crafts.module';
import { MaterialsModule } from './resources/materials/materials.module';
import { TechniquesModule } from './resources/techniques/techniques.module';
import { BadgesModule } from './resources/badges/badges.module';
import { CuratorialCategoriesModule } from './resources/curatorial-categories/curatorial-categories.module';
import { CategoriesModule } from './resources/categories/categories.module';
import { CareTagsModule } from './resources/care-tags/care-tags.module';
import { PaymentProvidersModule } from './resources/payment-providers/payment-providers.module';
import { PaymentIntentsModule } from './resources/payment-intents/payment-intents.module';
import { ArtisanOriginModule } from './resources/artisan-origin/artisan-origin.module';
import { ArtisanIdentityModule } from './resources/artisan-identity/artisan-identity.module';
import { ArtisanMaterialsModule } from './resources/artisan-materials/artisan-materials.module';
import { ArtisanMediaFamilyModule } from './resources/artisan-media-family/artisan-media-family.module';
import { ArtisanMediaWorkingModule } from './resources/artisan-media-working/artisan-media-working.module';
import { ArtisanMediaWorkshopModule } from './resources/artisan-media-workshop/artisan-media-workshop.module';
import { ArtisanMediaCommunityModule } from './resources/artisan-media-community/artisan-media-community.module';
import { ArtisanTerritorialModule } from './resources/artisan-territorial/artisan-territorial.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => ({
    //     uri:
    //       config.get<string>('MONGO_URI') ||
    //       'mongodb://localhost:27017/telar_cms',
    //   }),
    // }),
    S3Module,
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
    WishlistModule,
    AddressesModule,
    CartModule,
    CartItemsModule,
    OrdersModule,
    OrderItemsModule,
    PendingGiftCardOrdersModule,
    GiftCardsModule,
    CheckoutsModule,
    UserRolesModule,
    ServientregaModule,
    CartShippingInfoModule,
    NotificationsModule,
    ProductModerationHistoryModule,
    CobreModule,
    ProductVariantsModule,
    InventoryMovementsModule,
    FileUploadModule,
    CmsModule,
    // CmsSectionsModule,
    PaymentsModule,
    StoresModule,
    ProductsNewModule,
    CraftsModule,
    MaterialsModule,
    TechniquesModule,
    BadgesModule,
    CuratorialCategoriesModule,
    CategoriesModule,
    CareTagsModule,
    PaymentProvidersModule,
    PaymentIntentsModule,
    ArtisanOriginModule,
    ArtisanIdentityModule,
    ArtisanMaterialsModule,
    ArtisanMediaFamilyModule,
    ArtisanMediaWorkingModule,
    ArtisanMediaWorkshopModule,
    ArtisanMediaCommunityModule,
    ArtisanTerritorialModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
