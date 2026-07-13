import * as mongoose from 'mongoose';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async (): Promise<typeof mongoose> => {
      const uri = process.env.MONGO_URI
        || `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}/${process.env.MONGO_NAME}?authSource=${process.env.MONGO_AUTH_SOURCE || 'admin'}`;

      try {
        return await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 10000,
        });
      } catch (error) {
        console.error('Error en la conexion de MongoDB', error);
        throw error;
      }
    },
  },
];
