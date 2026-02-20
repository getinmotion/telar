import { DataSource } from 'typeorm';
import { GiftCard } from './entities/gift-card.entity';

export const giftCardsProviders = [
  {
    provide: 'GIFT_CARDS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(GiftCard),
    inject: ['DATA_SOURCE'],
  },
];
