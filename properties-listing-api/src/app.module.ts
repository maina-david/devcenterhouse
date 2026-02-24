import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PropertiesModule } from './properties/properties.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SavedPropertiesModule } from './saved-properties/saved-properties.module';
import { Property } from './properties/entities/property.entity';
import { User } from './users/entities/user.entity';
import { SavedProperty } from './saved-properties/entities/saved-property.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5432),
        username: config.get('DATABASE_USER', 'postgres'),
        password: config.get('DATABASE_PASSWORD', 'postgres'),
        database: config.get('DATABASE_NAME', 'properties_db'),
        entities: [Property, User, SavedProperty],
        synchronize: config.get('NODE_ENV') !== 'production',
        migrations: ['dist/database/migrations/*.js'],
        migrationsRun: config.get('NODE_ENV') === 'production',
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
    PropertiesModule,
    AuthModule,
    UsersModule,
    SavedPropertiesModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
