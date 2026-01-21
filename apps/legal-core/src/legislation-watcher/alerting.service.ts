import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqp-connection-manager';
import { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';

export interface LegislationUpdateEvent {
  eventType: 'legislation.updated';
  lawId: string;
  title: string;
  sourceUrl: string;
  changePercentage: number;
  diff: string;
  timestamp: Date;
  metadata?: {
    oldHash: string;
    newHash: string;
    keywords?: string[];
  };
}

@Injectable()
export class AlertingService implements OnModuleInit {
  private readonly logger = new Logger(AlertingService.name);
  private connection: amqp.AmqpConnectionManager;
  private channelWrapper: ChannelWrapper;
  private readonly queueName: string;

  constructor(private readonly configService: ConfigService) {
    this.queueName = this.configService.get<string>('RABBITMQ_QUEUE', 'legislation_updates');
  }

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    try {
      const rabbitMQUrl = this.configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672');
      
      this.connection = amqp.connect([rabbitMQUrl], {
        heartbeatIntervalInSeconds: 30,
        reconnectTimeInSeconds: 5,
      });

      this.connection.on('connect', () => {
        this.logger.log('Successfully connected to RabbitMQ');
      });

      this.connection.on('disconnect', (err) => {
        this.logger.error('Disconnected from RabbitMQ', err);
      });

      this.channelWrapper = this.connection.createChannel({
        json: true,
        setup: async (channel: ConfirmChannel) => {
          await channel.assertQueue(this.queueName, {
            durable: true,
            arguments: {
              'x-message-ttl': 86400000,
              'x-max-length': 10000
            }
          });

          await channel.assertExchange('legislation_events', 'topic', {
            durable: true
          });

          await channel.bindQueue(this.queueName, 'legislation_events', 'legislation.*');
          
          this.logger.log(`Queue "${this.queueName}" is ready`);
        }
      });

      await this.channelWrapper.waitForConnect();
      this.logger.log('RabbitMQ channel is ready');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error.stack);
      throw error;
    }
  }

  async sendLegislationUpdate(event: LegislationUpdateEvent): Promise<boolean> {
    try {
      await this.channelWrapper.publish(
        'legislation_events',
        'legislation.updated',
        event,
        {
          persistent: true,
          contentType: 'application/json',
          timestamp: Date.now(),
          messageId: `${event.lawId}-${Date.now()}`
        }
      );

      this.logger.log(`Legislation update event sent for law: ${event.lawId} (${event.title})`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send legislation update event: ${error.message}`, error.stack);
      return false;
    }
  }

  async sendBatchUpdates(events: LegislationUpdateEvent[]): Promise<number> {
    let successCount = 0;

    for (const event of events) {
      const success = await this.sendLegislationUpdate(event);
      if (success) successCount++;
    }

    this.logger.log(`Sent ${successCount}/${events.length} legislation update events`);
    return successCount;
  }

  async close() {
    try {
      await this.channelWrapper.close();
      await this.connection.close();
      this.logger.log('RabbitMQ connection closed');
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection', error.stack);
    }
  }

  isConnected(): boolean {
    return this.connection?.isConnected() || false;
  }
}
