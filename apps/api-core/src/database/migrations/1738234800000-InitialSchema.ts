import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1738234800000 implements MigrationInterface {
  name = 'InitialSchema1738234800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "payment_status_enum" AS ENUM ('pending', 'waiting_for_capture', 'succeeded', 'canceled', 'refunded')
    `);
    await queryRunner.query(`
      CREATE TYPE "payment_provider_enum" AS ENUM ('yookassa', 'sbp')
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "device_id" varchar(64) NOT NULL,
        "citizenship_code" varchar(3),
        "region_code" varchar(10),
        "entry_date" date,
        "visit_purpose" varchar(20),
        "registration_date" date,
        "patent_date" date,
        "onboarding_completed_at" timestamptz,
        "subscription_type" varchar(20) NOT NULL DEFAULT 'free',
        "subscription_expires_at" timestamptz,
        "settings" jsonb NOT NULL DEFAULT '{"locale":"ru","notifications":{"push":true,"telegram":false,"deadlines":true,"news":true},"timezone":"Europe/Moscow"}',
        "refresh_token_hash" varchar(64),
        "signing_key" varchar(64),
        "recovery_code_hash" varchar(64),
        "recovery_attempts" int NOT NULL DEFAULT 0,
        "recovery_blocked_until" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        CONSTRAINT "UQ_users_device_id" UNIQUE ("device_id"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_users_device_id" ON "users" ("device_id")
    `);

    // Create audit_log table
    await queryRunner.query(`
      CREATE TABLE "audit_log" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid,
        "action" varchar(10) NOT NULL,
        "resource" varchar(255) NOT NULL,
        "request_body" jsonb,
        "response_status" int NOT NULL,
        "ip_address" varchar(45) NOT NULL,
        "user_agent" varchar(500) NOT NULL,
        "duration_ms" int NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_log" PRIMARY KEY ("id"),
        CONSTRAINT "FK_audit_log_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_audit_log_user_id" ON "audit_log" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_audit_log_resource" ON "audit_log" ("resource")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_audit_log_created_at" ON "audit_log" ("created_at")
    `);

    // Create exam_progress table
    await queryRunner.query(`
      CREATE TABLE "exam_progress" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "device_id" varchar(64) NOT NULL,
        "category_progress" jsonb NOT NULL DEFAULT '{}',
        "answered_question_ids" jsonb NOT NULL DEFAULT '[]',
        "streak" int NOT NULL DEFAULT 0,
        "last_activity_date" date,
        "achievements" jsonb NOT NULL DEFAULT '[]',
        "tests_completed" int NOT NULL DEFAULT 0,
        "best_score" int NOT NULL DEFAULT 0,
        "recent_results" jsonb NOT NULL DEFAULT '[]',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_exam_progress" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_exam_progress_device_id" ON "exam_progress" ("device_id")
    `);

    // Create payments table
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "external_id" varchar(64),
        "amount" decimal(10,2) NOT NULL,
        "currency" varchar(3) NOT NULL DEFAULT 'RUB',
        "status" "payment_status_enum" NOT NULL DEFAULT 'pending',
        "provider" "payment_provider_enum" NOT NULL DEFAULT 'yookassa',
        "description" varchar(255) NOT NULL,
        "metadata" jsonb,
        "payment_url" varchar(512),
        "idempotency_key" varchar(64) NOT NULL,
        "paid_at" timestamptz,
        "canceled_at" timestamptz,
        "cancellation_reason" varchar(255),
        "refunded_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payments_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_payments_user_id" ON "payments" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_payments_external_id" ON "payments" ("external_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_payments_status" ON "payments" ("status")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_payments_idempotency_key" ON "payments" ("idempotency_key")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_payments_created_at" ON "payments" ("created_at")
    `);

    // Create knowledge_embeddings table
    await queryRunner.query(`
      CREATE TABLE "knowledge_embeddings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "knowledge_id" varchar(50) NOT NULL,
        "category" varchar(50) NOT NULL,
        "question_ru" text NOT NULL,
        "question_en" text NOT NULL,
        "answer_ru" text NOT NULL,
        "answer_en" text NOT NULL,
        "tags" text,
        "legal_reference" varchar(200),
        "embedding_ru" text,
        "embedding_en" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_knowledge_embeddings_knowledge_id" UNIQUE ("knowledge_id"),
        CONSTRAINT "PK_knowledge_embeddings" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_knowledge_embeddings_knowledge_id" ON "knowledge_embeddings" ("knowledge_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_knowledge_embeddings_category" ON "knowledge_embeddings" ("category")
    `);

    // Create backups table
    await queryRunner.query(`
      CREATE TABLE "backups" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "device_id" varchar(64) NOT NULL,
        "encrypted_data" bytea NOT NULL,
        "salt" varchar(64) NOT NULL,
        "iv" varchar(64) NOT NULL,
        "size_bytes" int NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_backups" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_backups_device_id" ON "backups" ("device_id")
    `);

    // Create fcm_tokens table
    await queryRunner.query(`
      CREATE TABLE "fcm_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "device_id" varchar(64) NOT NULL,
        "token" varchar(255) NOT NULL,
        "platform" varchar(10) NOT NULL,
        "notification_preferences" jsonb NOT NULL DEFAULT '{"document_expiry":true,"patent_payment":true,"news":true}',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_fcm_tokens_token" UNIQUE ("token"),
        CONSTRAINT "PK_fcm_tokens" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_fcm_tokens_device_id" ON "fcm_tokens" ("device_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_fcm_tokens_token" ON "fcm_tokens" ("token")
    `);

    // Enable uuid-ossp extension if not exists
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order (respect foreign keys)
    await queryRunner.query(`DROP TABLE IF EXISTS "fcm_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "backups"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "knowledge_embeddings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "exam_progress"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_log"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_provider_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_status_enum"`);
  }
}
