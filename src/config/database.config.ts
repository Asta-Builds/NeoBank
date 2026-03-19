import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'neobank',
    autoLoadEntities: true,
    synchronize: process.env.NODE_ENV !== 'production', // Use migrations in production
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    logging: process.env.NODE_ENV === 'development',
  }),
);
