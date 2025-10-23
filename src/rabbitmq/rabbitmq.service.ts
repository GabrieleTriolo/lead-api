import { Injectable, OnModuleInit } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class RabbitmqService implements OnModuleInit {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async onModuleInit() {
    await this.amqpConnection.managedChannel.addSetup(async (channel) => {
      await channel.assertQueue('crm.lead.process', { durable: true });
    });
  }

  async sendToQueue(queue: string, payload: unknown): Promise<void> {
    await this.amqpConnection.publish('', queue, payload as Record<string, any>);
  }
}
