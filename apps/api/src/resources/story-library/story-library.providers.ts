import { DataSource } from 'typeorm';
import { StoryLibrary } from './entities/story-library.entity';

export const storyLibraryProviders = [
  {
    provide: 'STORY_LIBRARY_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(StoryLibrary),
    inject: ['DATA_SOURCE'],
  },
];
