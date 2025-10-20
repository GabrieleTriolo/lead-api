import { Module } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('RABBITMQ_URI', 'amqp://lead-api:lead-api-pwd@rabbitmq:5672'),
        connectionInitOptions: { wait: false },
        connectionManagerOptions: {
          reconnectTimeInSeconds: 15,
        },
        prefetchCount: 1,
        exchanges: [],
      }),
    }),
  ],
  providers: [RabbitmqService],
  exports: [RabbitMQModule],
})
export class RabbitmqModule {}