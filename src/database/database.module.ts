import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'db'),
        port: parseInt(config.get<string>('DB_PORT', '3306'), 10),
        username: config.get<string>('DB_USER', 'app'),
        password: config.get<string>('DB_PASSWORD', 'app_pwd'),
        database: config.get<string>('DB_NAME', 'lead_api'),
        autoLoadEntities: true,
        retryAttempts: 20,
        retryDelay: 3000,
      }),
    }),
  ],
})
export class DatabaseModule {}
