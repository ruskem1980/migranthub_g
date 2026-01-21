import { Transport, RmqOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

export const getRabbitMQConfig = (configService: ConfigService): RmqOptions => ({
  transport: Transport.RMQ,
  options: {
    urls: [configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672')],
    queue: configService.get<string>('RABBITMQ_QUEUE', 'legislation_updates'),
    queueOptions: {
      durable: true,
    },
    noAck: false,
    prefetchCount: 1,
  },
});
