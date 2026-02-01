import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import amqplib from 'amqplib';
import { LegalService } from './legal.service';

/**
 * Event structure from legal-core
 */
export interface LegislationUpdateEvent {
  eventType: 'legislation.updated';
  lawId: string;
  title: string;
  sourceUrl: string;
  changePercentage: number;
  diff: string;
  timestamp: string;
  metadata: {
    oldHash: string;
    newHash: string;
    keywords: string[];
  };
}

@Injectable()
export class LegalSyncService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LegalSyncService.name);
  // Using any type due to amqplib type incompatibilities
  private connection: amqplib.ChannelModel | null = null;
  private channel: amqplib.Channel | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly legalService: LegalService,
  ) {}

  async onModuleInit(): Promise<void> {
    const enabled = this.configService.get<boolean>('rabbitmq.enabled', false);

    if (!enabled) {
      this.logger.log('RabbitMQ sync is disabled. Skipping connection.');
      return;
    }

    await this.connectToRabbitMQ();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  /**
   * Connect to RabbitMQ and start consuming messages
   */
  private async connectToRabbitMQ(): Promise<void> {
    const url = this.configService.get<string>('rabbitmq.url', 'amqp://localhost:5672');
    const exchange = this.configService.get<string>('rabbitmq.exchange', 'legislation_events');
    const queue = this.configService.get<string>('rabbitmq.queue', 'api-core-legal-updates');
    const routingKey = this.configService.get<string>('rabbitmq.routingKey', 'legislation.updated');

    try {
      this.logger.log(`Connecting to RabbitMQ at ${url}...`);

      this.connection = await amqplib.connect(url);
      this.channel = await this.connection.createChannel();

      // Declare exchange (topic type for routing key patterns)
      await this.channel.assertExchange(exchange, 'topic', { durable: true });

      // Declare queue
      await this.channel.assertQueue(queue, { durable: true });

      // Bind queue to exchange with routing key
      await this.channel.bindQueue(queue, exchange, routingKey);

      this.logger.log(`Connected to RabbitMQ. Listening on queue: ${queue}`);

      // Start consuming messages
      await this.channel.consume(queue, (msg: amqplib.ConsumeMessage | null) => {
        if (msg) {
          this.handleMessage(msg);
          this.channel?.ack(msg);
        }
      });

      // Handle connection errors
      this.connection.on('error', (err: Error) => {
        this.logger.error('RabbitMQ connection error:', err.message);
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed. Attempting to reconnect...');
        setTimeout(() => this.connectToRabbitMQ(), 5000);
      });
    } catch (error) {
      this.logger.error(`Failed to connect to RabbitMQ: ${error instanceof Error ? error.message : error}`);
      // Retry connection after 10 seconds
      setTimeout(() => this.connectToRabbitMQ(), 10000);
    }
  }

  /**
   * Handle incoming message from RabbitMQ
   */
  private handleMessage(msg: amqplib.ConsumeMessage): void {
    try {
      const content = msg.content.toString();
      const event: LegislationUpdateEvent = JSON.parse(content);

      this.logger.log(`Received legislation update event: ${event.eventType}`);
      this.logger.debug(`Event details: lawId=${event.lawId}, title="${event.title}", changePercentage=${event.changePercentage}%`);

      // Update metadata in LegalService
      this.legalService.updateMetadata({
        lastUpdatedAt: event.timestamp,
        source: event.sourceUrl,
      });

      // Log the update for monitoring
      this.logger.log(`Updated legal metadata. New lastUpdatedAt: ${event.timestamp}`);

      // Log keywords for debugging
      if (event.metadata?.keywords?.length > 0) {
        this.logger.debug(`Keywords: ${event.metadata.keywords.join(', ')}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process message: ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Disconnect from RabbitMQ
   */
  private async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      this.logger.log('Disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error(`Error disconnecting from RabbitMQ: ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Check if connected to RabbitMQ
   */
  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}
