import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssistantService } from './assistant.service';
import { AssistantController } from './assistant.controller';
import { EmbeddingsService } from './embeddings.service';
import { CircuitBreakerService } from './circuit-breaker.service';
import { PiiFilterService } from './pii-filter.service';
import { KnowledgeEmbedding } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeEmbedding])],
  controllers: [AssistantController],
  providers: [AssistantService, EmbeddingsService, CircuitBreakerService, PiiFilterService],
  exports: [AssistantService, EmbeddingsService, PiiFilterService],
})
export class AssistantModule {}
