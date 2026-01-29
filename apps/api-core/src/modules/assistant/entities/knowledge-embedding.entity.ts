import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

/**
 * Entity for storing knowledge base embeddings
 * Uses pgvector for similarity search
 */
@Entity('knowledge_embeddings')
export class KnowledgeEmbedding {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'knowledge_id', type: 'varchar', length: 50, unique: true })
  @Index('idx_knowledge_embeddings_knowledge_id')
  knowledgeId!: string;

  @Column({ type: 'varchar', length: 50 })
  @Index('idx_knowledge_embeddings_category')
  category!: string;

  @Column({ name: 'question_ru', type: 'text' })
  questionRu!: string;

  @Column({ name: 'question_en', type: 'text' })
  questionEn!: string;

  @Column({ name: 'answer_ru', type: 'text' })
  answerRu!: string;

  @Column({ name: 'answer_en', type: 'text' })
  answerEn!: string;

  @Column('simple-array', { nullable: true })
  tags!: string[] | null;

  @Column({ name: 'legal_reference', type: 'varchar', length: 200, nullable: true })
  legalReference!: string | null;

  /**
   * Embedding vector (1536 dimensions for text-embedding-3-small)
   * Stored as text since TypeORM doesn't natively support pgvector
   * Migration will create the actual vector column
   */
  @Column({ type: 'text', name: 'embedding_ru', nullable: true })
  embeddingRu!: string | null;

  @Column({ type: 'text', name: 'embedding_en', nullable: true })
  embeddingEn!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
