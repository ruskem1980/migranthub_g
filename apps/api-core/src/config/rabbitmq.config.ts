import { registerAs } from '@nestjs/config';

export default registerAs('rabbitmq', () => ({
  url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  exchange: process.env.RABBITMQ_EXCHANGE || 'legislation_events',
  queue: process.env.RABBITMQ_LEGAL_QUEUE || 'api-core-legal-updates',
  routingKey: process.env.RABBITMQ_ROUTING_KEY || 'legislation.updated',
  enabled: process.env.RABBITMQ_ENABLED === 'true',
}));
